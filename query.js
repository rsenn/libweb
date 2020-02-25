// var Util = require('./utils/util.js');

var Util = require('./util.js');
// var mysql = require("mysql");
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'lotto',
  password: 'tD51o7xf',
  database: 'lotto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

var select = {
  latest(table, rfn) {
    pool.query('SELECT * FROM ' + table + ' ORDER BY id DESC LIMIT 1').then(res => rfn([...res[0]][0]));
  },
  ids(table, rfn) {
    pool.query('SELECT id FROM ' + table + ' ORDER BY id').then(res => rfn([...res[0]].map(r => r.id)));
  },
  insertRow(table, values, rfn) {
    pool.query(
      'INSERT INTO ' +
        table +
        ' (user_id,drawing_id,numbers,stars,start_date,end_date) VALUES (' +
        [values.user_id, values.drawing_id, values.numbers, values.stars, values.start_date, values.end_date].join(','),
      (error, results) => console.log({ error, results })
    );
  },
  next_id(table, rfn) {
    pool.query('SELECT id FROM ' + table + ' ORDER BY id DESC LIMIT 1').then((res = rfn([...res[0]])));
  }
};

var numbers = (r = [1, 50], n = 5) => Util.sortNum(Util.draw(Util.range(r[0], r[1]), n));

function insertTicket(user_id, drawing_id, date) {
  var values = {
    numbers: Util.numbersToBits(numbers([1, 50], 5)),
    stars: Util.numbersToBits(numbers([1, 12], 2)),
    start_date: new Date(Date.now()).toISOString().substring(0, 10),
    end_date: '2019-04-24',
    drawing_id,
    user_id
  };

  console.log(
    'INSERT INTO tickets (' +
      Object.keys(values).join(',') +
      ') VALUES (' +
      Object.values(values)
        .map(v => `'${v}'`)
        .join(',') +
      ');'
  );
  /*console.log(`Ticket `, values);
  select.insertRow('tickets', values);*/
}

const queries = {
  updateTickets: () =>
    select.ids('tickets', ticket_ids => {
      for(let i = 0; i < ticket_ids.length; i++) {
        let id = ticket_ids[i];
        var a = [Util.numbersToBits(numbers([1, 50], 5)), Util.numbersToBits(numbers([1, 12], 2))];
        q = 'UPDATE tickets SET numbers=' + a[0] + ',stars=' + a[1] + ' WHERE id=' + id + ';';
        console.log('q: ', q);

        updateConn.query(q, function(error, results, fields) {});
      }
    }),
  insertTickets: (num = 1000) => {
    num = parseInt(num);
    select.ids('users', userid_list => {
      select.latest('drawings', drawing => {
        console.log('latest drawing: ', drawing);

        userid_list.forEach(id => {
          Util.range(1, 10).forEach(i => {
            let res = insertTicket(id, drawing.id, drawing.date);
            num--;
            if(num <= 0) process.exit(0);
          });
        });
      });
    });
  },
  insertUsers(num = 1000) {
    let c = newConnection();
    select.next_id('users', function(id) {
      num = parseInt(num) + id;
      console.log('insertUsers: ', { id, num });

      for(let i = id; i < num; i++) {
        let user_profile = {
          user_id: i,
          locale: 'en',
          cash_unit: 'IRR',
          alt_show: 1,
          alt_unit: 'EUR'
        };
        let user = {
          id: i,
          username: `user${i}`,
          email: `user.${i}@anymail.info`,
          slug: `user-${i}`,
          password: `pass#${i}`,
          encrypted_password: '',
          admin: 0,
          balance: 782196
        };

        console.log('insertUsers: ', { user, user_profile });
        let res = [select.insertRow('user_profiles', user_profile), select.insertRow('users', user)];
        console.log('res: ', res);
      }
    });
  },
  activationLinks(args) {
    let host = args[0] || 'localhost';
    let port = parseInt(args[1]) || 8080;
    const encodeGetParams = p =>
      Object.entries(p)
        .map(kv => kv.join('='))
        .join('&');

    let q =
      'SELECT user_id,email,password,balance,password_reset_token FROM users INNER JOIN user_profiles ON users.id=user_profiles.user_id WHERE (user_profiles.password_reset_token LIKE "act%") OR (user_profiles.first_name="" AND user_profiles.last_name="")';
    console.log({ q });

    pool.query(q).then(set => {
      var pending = [...set[0]].map(row => {
        let activationCode = String(row['password_reset_token']).replace(/.*:/, '');
        let obj = { email: row['email'], id: row['user_id'], step: 2 };
        if(activationCode != 'null' && activationCode != '') obj.activate = activationCode;
        return obj;
      });

      var shell = pending.map(obj => `request /activate '${JSON.stringify(obj)}'`).join('\n');
      var urls = pending.map(obj => 'http://' + host + ':' + port + '/register?' + encodeGetParams(obj)).join('\n');

      console.log(shell);
      console.log(urls);
    });
  }
};

queries[process.argv[2]](process.argv.slice(3));
// sleep(10);
// connection.end();

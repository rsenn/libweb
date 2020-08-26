//eslump fuzz test warpper. we haven't pass it yet...
let cp = require('child_process');
let fs = require('fs');
let os = require('os');
module.exports = ({ code, sourceType, reproductionData = {} }) => {
  fs.writeFileSync('gen/temp.js', code);
  let posixcmd = 'cd gen && grun JavaScript program temp.js 2>&1 1>/dev/null';
  let cmd = {
    aix: posixcmd,
    //android: posixcmd
    darwin: posixcmd,
    freebsd: posixcmd,
    linux: posixcmd,
    openbsd: posixcmd,
    //sunos: posixcmd,
    win32: 'cd gen && grun JavaScript program temp.js 2>&1 1>NUL'
  };
  let child = cp.execSync(cmd[os.platform()]).toString();

  if(child.length > 0) {
    console.log('');
    console.log(child);
    return {
      child,
      reproductionData
    };
  }
};

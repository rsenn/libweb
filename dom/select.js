import React from 'react';

export class Select extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { options, ...props } = this.props;

    //console.log('Select.render ', { options, props });
    const Option = ({ children, ...props }) => {
      //console.log('Select.render Option ', { children, props });

      return <option {...props}>{children}</option>;
    };

    //return <select {...props}>{
    //Object.keys(options).map(key =>
    //<Option value={key}>{options[key]}</Option>
    //)
    //}</select>
  }
}

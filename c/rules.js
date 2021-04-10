/*jshint sub:true*/

import Util from '../util.js';
import { EPSILON, TERMINAL, iterate_over_rules } from './commons.js';

/*
 * abstract_declarator -> pointer direct_abstract_declarator
 *                      | direct_abstract_declarator
 *                      | pointer
 * */
export function abstract_declarator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'abstract_declarator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = pointer(token_stream, arrow);
      if(child_1) child_2 = direct_abstract_declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = direct_abstract_declarator(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = pointer(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * additive_expr -> multiplicative_expr additive_expr_p
 * */
export function additive_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'additive_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = multiplicative_expr(token_stream, arrow);
      if(child_1) child_2 = additive_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   additive_expr_p -> '+' multiplicative_expr additive_expr_p
 *                    | '-' multiplicative_expr additive_expr_p
 *                    | EPSILON
 * */
export function additive_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'additive_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '+');
      if(child_1) child_2 = multiplicative_expr(token_stream, arrow);
      if(child_2) child_3 = additive_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '-');
      if(child_1) child_2 = multiplicative_expr(token_stream, arrow);
      if(child_2) child_3 = additive_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * and_expr -> equality_expr and_expr_p
 * */
export function and_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'and_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = equality_expr(token_stream, arrow);
      if(child_1) child_2 = and_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   and_expr_p -> '&' equality_expr and_expr_p
 *               | EPSILON
 * */
export function and_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'and_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '&');
      if(child_1) child_2 = equality_expr(token_stream, arrow);
      if(child_2) child_3 = and_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * argument_expr_list -> assignment_expr argument_expr_list_p
 * */
export function argument_expr_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'argument_expr_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = assignment_expr(token_stream, arrow);
      if(child_1) child_2 = argument_expr_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   argument_expr_list_p -> ',' assignment_expr argument_expr_list_p
 *                         | EPSILON
 * */
export function argument_expr_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'argument_expr_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = assignment_expr(token_stream, arrow);
      if(child_2) child_3 = argument_expr_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * assignment_expr -> unary_expr assignment_operator assignment_expr
 *                  | conditional_expr
 * */
export function assignment_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'assignment_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = unary_expr(token_stream, arrow);
      if(child_1) child_2 = assignment_operator(token_stream, arrow);
      if(child_2) child_3 = assignment_expr(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = conditional_expr(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  assignment_operator -> '='
 *                       | MUL_ASSIGN
 *                       | DIV_ASSIGN
 *                       | MOD_ASSIGN
 *                       | ADD_ASSIGN
 *                       | SUB_ASSIGN
 *                       | LEFT_ASSIGN
 *                       | RIGHT_ASSIGN
 *                       | AND_ASSIGN
 *                       | XOR_ASSIGN
 *                       | OR_ASSIGN
 * */
export function assignment_operator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'assignment_operator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '=');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'MUL_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'DIV_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'MOD_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'ADD_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'SUB_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'LEFT_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'RIGHT_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'AND_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'XOR_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'OR_ASSIGN');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * block_item_list -> block_item block_item_list_p
 * */
export function block_item_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'block_item_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = block_item(token_stream, arrow);
      if(child_1) child_2 = block_item_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   block_item_list_p -> block_item block_item_list_p
 *                      | EPSILON
 * */
export function block_item_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'block_item_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = block_item(token_stream, arrow);
      if(child_1) child_2 = block_item_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  block_item -> stmt
 *              | declaration
 * */
export function block_item(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'block_item';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = declaration(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  cast_expr -> '(' type_name ')' cast_expr
 *             | unary_expr
 * */
export function cast_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'cast_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = type_name(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = cast_expr(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = unary_expr(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  compound_stmt -> '{' block_item_list '}'
 *                 | '{' '}'
 * */
export function compound_stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'compound_stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '{');
      if(child_1) child_2 = block_item_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, '}');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, '{');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '}');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  conditional_expr -> logical_or_expr '?' expr ':' conditional_expr
 *                    | logical_or_expr
 * */
export function conditional_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'conditional_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = logical_or_expr(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '?');
      if(child_2) child_3 = expr(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ':');
      if(child_4) child_5 = conditional_expr(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = logical_or_expr(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  constant_expr -> conditional_expr
 * */
export function constant_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'constant_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = conditional_expr(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  declaration -> declaration_specifiers init_declarator_list ';'
 *               | declaration_specifiers ';'
 *               | type_name init_declarator_list ';'
 * */
export function declaration(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'declaration';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) child_2 = init_declarator_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ';');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ';');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = type_name(token_stream, arrow);
      if(child_1) child_2 = init_declarator_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ';');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   declaration_list -> declaration declaration_list_p
 * */
export function declaration_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'declaration_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = declaration(token_stream, arrow);
      if(child_1) child_2 = declaration_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   declaration_list_p -> declaration declaration_list_p
 *                       | EPSILON
 * */
export function declaration_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'declaration_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = declaration(token_stream, arrow);
      if(child_1) child_2 = declaration_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  declaration_specifiers -> storage_class_specifier declaration_specifiers
 *                          | storage_class_specifier
 *                          | type_specifier declaration_specifiers
 *                          | type_specifier
 *                          | type_qualifier declaration_specifiers
 *                          | type_qualifier
 *                          | function_specifier declaration_specifiers
 *                          | function_specifier
 * */
export function declaration_specifiers(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'declaration_specifiers';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = storage_class_specifier(token_stream, arrow);
      if(child_1) child_2 = declaration_specifiers(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = storage_class_specifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = type_specifier(token_stream, arrow);
      if(child_1) child_2 = declaration_specifiers(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = type_specifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = type_qualifier(token_stream, arrow);
      if(child_1) child_2 = declaration_specifiers(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = type_qualifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = function_specifier(token_stream, arrow);
      if(child_1) child_2 = declaration_specifiers(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = function_specifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  declarator -> pointer direct_declarator
 *              | direct_declarator
 * */
export function declarator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'declarator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = pointer(token_stream, arrow);
      if(child_1) child_2 = direct_declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = direct_declarator(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  designation -> designator_list '='
 * */
export function designation(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'designation';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = designator_list(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '=');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  designator_list -> designator designator_list_p
 * */
export function designator_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'designator_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = designator(token_stream, arrow);
      if(child_1) child_2 = designator_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  designator_list_p -> designator designator_list_p
 *                     | EPSILON
 * */
export function designator_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'designator_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = designator(token_stream, arrow);
      if(child_1) child_2 = designator_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  designator -> '[' constant_expr ']'
 *              | '.' IDENTIFIER
 * */
export function designator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'designator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = constant_expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, '.');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  direct_abstract_declarator -> '(' abstract_declarator ')' direct_abstract_declarator_p
 *                              | '[' ']' direct_abstract_declarator_p
 *                              | '[' assignment_expr ']' direct_abstract_declarator_p
 *                              | '[' '*' ']' direct_abstract_declarator_p
 *                              | '(' ')' direct_abstract_declarator_p
 *                              | '(' parameter_type_list ')' direct_abstract_declarator_p
 * */
export function direct_abstract_declarator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'direct_abstract_declarator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = abstract_declarator(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ']');
      if(child_2) child_3 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = assignment_expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '*');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ')');
      if(child_2) child_3 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = parameter_type_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   direct_abstract_declarator_p -> '[' ']' direct_abstract_declarator_p
 *                                 | '[' assignment_expr ']' direct_abstract_declarator_p
 *                                 | '[' '*' ']' direct_abstract_declarator_p
 *                                 | '(' ')' direct_abstract_declarator_p
 *                                 | '(' parameter_type_list ')' direct_abstract_declarator_p
 *                                 | EPSILON
 * */
export function direct_abstract_declarator_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'direct_abstract_declarator_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ']');
      if(child_2) child_3 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = constant_expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '*');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ')');
      if(child_2) child_3 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = parameter_type_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = direct_abstract_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  direct_declarator -> IDENTIFIER direct_declarator_p
 *                     | '(' declarator ')' direct_declarator_p
 * */
export function direct_declarator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'direct_declarator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) child_2 = direct_declarator_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = declarator(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = direct_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  direct_declarator_p -> '[' type_qualifier_list assignment_expr ']' direct_declarator_p
 *                       | '[' type_qualifier_list ']' direct_declarator_p
 *                       | '[' assignment_expr ']' direct_declarator_p
 *                       | '[' STATIC type_qualifier_list assignment_expr ']' direct_declarator_p
 *                       | '[' type_qualifier_list STATIC assignment_expr ']' direct_declarator_p
 *                       | '[' type_qualifier_list '*' ']' direct_declarator_p
 *                       | '[' '*' ']' direct_declarator_p
 *                       | '[' ']' direct_declarator_p
 *                       | '(' 'parameter_type_list' ')' direct_declarator_p
 *                       | '(' identifier_list ')' direct_declarator_p
 *                       | '(' ')' direct_declarator_p
 *                       | EPSILON
 * */
var direct_declarator_p = function(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'direct_declarator_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      // '[' type_qualifier_list assignment_expr ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = type_qualifier_list(token_stream, arrow);
      if(child_2) child_3 = assignment_expr(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ']');
      if(child_4) child_5 = direct_declarator_p(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      // '[' type_qualifier_list ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = type_qualifier_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      // '[' assignment_expr ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = assignment_expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      // '[' STATIC type_qualifier_list assignment_expr ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'static');
      if(child_2) child_3 = type_qualifier_list(token_stream, arrow);
      if(child_3) child_4 = assignment_expr(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, ']');
      if(child_5) child_6 = direct_declarator_p(token_stream, arrow);
      if(child_6) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
      }
    },
    function (token_stream, arrow, node) {
      // '[' type_qualifier_list STATIC assignment_expr ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = type_qualifier_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, 'static');
      if(child_3) child_4 = assignment_expr(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, ']');
      if(child_5) child_6 = direct_declarator_p(token_stream, arrow);
      if(child_6) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
      }
    },
    function (token_stream, arrow, node) {
      // '[' type_qualifier_list '*' ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = type_qualifier_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, '*');
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ']');
      if(child_4) child_5 = direct_declarator_p(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      // '[' '*' ']' direct_declarator_p
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '*');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = direct_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ']');
      //if(child_2) child_3 = constant_expr(token_stream, arrow);
      if(child_2) child_3 = direct_declarator_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = parameter_type_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = direct_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = identifier_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = direct_declarator_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ')');
      if(child_2) child_3 = direct_declarator_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
};

/*
 *  enum_specifier -> ENUM IDENTIFIER '{' enumerator_list '}'
 *                  | ENUM '{' enumerator_list '}'
 *                  | ENUM IDENTIFIER '{' enumerator_list ',' '}'
 *                  | ENUM '{' enumerator_list ',' '}'
 *                  | ENUM IDENTIFIER
 * */
export function enum_specifier(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'enum_specifier';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, 'ENUM');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, '{');
      if(child_3) child_4 = enumerator_list(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, '}');
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, 'ENUM');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '{');
      if(child_2) child_3 = enumerator_list(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, '}');
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      child_1 = TERMINAL(token_stream, arrow, 'ENUM');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, '{');
      if(child_3) child_4 = enumerator_list(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, ',');
      if(child_5) child_6 = TERMINAL(token_stream, arrow, '}');
      if(child_6) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, 'ENUM');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '{');
      if(child_2) child_3 = enumerator_list(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ',');
      if(child_4) child_5 = TERMINAL(token_stream, arrow, '}');
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'ENUM');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * enumerator -> IDENTIFIER '=' constant_expr
 *             | IDENTIFIER
 * */
export function enumerator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'enumerator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '=');
      if(child_2) child_3 = constant_expr(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  enumerator_list -> enumerator enumerator_list_p
 * */
export function enumerator_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'enumerator_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = enumerator(token_stream, arrow);
      if(child_1) child_2 = enumerator_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  enumerator_list_p -> enumerator enumerator_list_p
 *                     | EPSILON
 * */
export function enumerator_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'enumerator_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = enumerator(token_stream, arrow);
      if(child_2) child_3 = enumerator_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * equality_expr -> relational_expr equality_expr_p
 * */
export function equality_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'equality_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = relational_expr(token_stream, arrow);
      if(child_1) child_2 = equality_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   equality_expr_p -> EQ_OP relational_expr equality_expr_p
 *                    | NE_OP relational_expr equality_expr_p
 *                    | EPSILON
 * */
export function equality_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'equality_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'EQ_OP');
      if(child_1) child_2 = relational_expr(token_stream, arrow);
      if(child_2) child_3 = equality_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'NE_OP');
      if(child_1) child_2 = relational_expr(token_stream, arrow);
      if(child_2) child_3 = equality_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * exclusive_or_expr -> and_expr exclusive_or_expr_p
 * */
export function exclusive_or_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'exclusive_or_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = and_expr(token_stream, arrow);
      if(child_1) child_2 = exclusive_or_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   exclusive_or_expr_p -> '^' and_expr exclusive_or_expr_p
 *                        | EPSILON
 * */
export function exclusive_or_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'exclusive_or_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '^');
      if(child_1) child_2 = and_expr(token_stream, arrow);
      if(child_2) child_3 = exclusive_or_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * expr -> assignment_expr expr_p
 * */
export function expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = assignment_expr(token_stream, arrow);
      if(child_1) child_2 = expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   expr_p -> ',' assignment_expr expr_p
 *           | EPSILON
 * */
export function expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = assignment_expr(token_stream, arrow);
      if(child_2) child_3 = expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  expression_stmt -> ';'
 *                   | expr ';'
 * */
export function expression_stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'expression_stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, ';');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = expr(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ';');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   external_declaration -> function_definition
 *                         | declaration
 * */
var external_declaration_1 = function(token_stream, arrow, node) {
  var child_1 = null;
  child_1 = function_definition(token_stream, arrow);
  if(child_1) {
    node['children'].push(child_1);
  }
};
var external_declaration_2 = function(token_stream, arrow, node) {
  var child_1 = null;
  child_1 = declaration(token_stream, arrow);
  if(child_1) {
    node['children'].push(child_1);
  }
};
export function external_declaration(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'external_declaration';
  new_node['children'] = [];
  var list_of_rules = [external_declaration_1, external_declaration_2];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  function_definition -> declaration_specifiers declarator declaration_list compound_stmt
 *                       | declaration_specifiers declarator compound_stmt
 * */
export function function_definition(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'function_definition';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) child_2 = declarator(token_stream, arrow);
      if(child_2) child_3 = declaration_list(token_stream, arrow);
      if(child_3) child_4 = compound_stmt(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) child_2 = declarator(token_stream, arrow);
      if(child_2) child_3 = compound_stmt(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  function_specifier -> INLINE
 * */
export function function_specifier(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'function_specifier';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'INLINE');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  identifier_list -> IDENTIFIER identifier_list_p
 * */
export function identifier_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'identifier_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) child_2 = identifier_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  identifier_list_p -> ',' IDENTIFIER identifier_list_p
 *                     | EPSILON
 * */
export function identifier_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'identifier_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = identifier_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * inclusive_or_expr -> exclusive_or_expr inclusive_or_expr_p
 * */
export function inclusive_or_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'inclusive_or_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = exclusive_or_expr(token_stream, arrow);
      if(child_1) child_2 = inclusive_or_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   inclusive_or_expr_p -> '|' exclusive_or_expr inclusive_or_expr_p
 *                        | EPSILON
 * */
export function inclusive_or_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'inclusive_or_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '|');
      if(child_1) child_2 = exclusive_or_expr(token_stream, arrow);
      if(child_2) child_3 = inclusive_or_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  init_declarator -> declarator '=' initializer
 *                   | declarator
 * */
export function init_declarator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'init_declarator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = declarator(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '=');
      if(child_2) child_3 = initializer(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = declarator(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  init_declarator_list -> init_declarator init_declarator_list_p
 * */
export function init_declarator_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'init_declarator_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = init_declarator(token_stream, arrow);
      if(child_1) child_2 = init_declarator_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  init_declarator_list_p -> ',' init_declarator init_declarator_list_p
 *                          | EPSILON
 * */
export function init_declarator_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'init_declarator_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = init_declarator(token_stream, arrow);
      if(child_2) child_3 = init_declarator_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  initializer -> assignment_expr
 *               | '{' initializer_list '}'
 *               | '{' initializer_list ';' '}'
 * */
export function initializer(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'initializer';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = assignment_expr(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '{');
      if(child_1) child_2 = initializer_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, '}');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '{');
      if(child_1) child_2 = initializer_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ';');
      if(child_3) child_4 = TERMINAL(token_stream, arrow, '}');
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * initializer_list -> initializer initializer_list_p
 *                   | designation initializer initializer_list_p
 * */
export function initializer_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'initializer_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = initializer(token_stream, arrow);
      if(child_1) child_2 = initializer_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = designation(token_stream, arrow);
      if(child_1) child_2 = initializer(token_stream, arrow);
      if(child_2) child_3 = initializer_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   initializer_list_p -> ',' initializer initializer_list_p
 *                       | ',' designation initializer initializer_list_p
 *                       | EPSILON
 * */
export function initializer_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'initializer_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = initializer(token_stream, arrow);
      if(child_2) child_3 = initializer_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = designation(token_stream, arrow);
      if(child_2) child_3 = initializer(token_stream, arrow);
      if(child_3) child_4 = initializer_list_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   iteration_stmt -> WHILE '(' expr ')' stmt
 *                   | DO stmt WHILE '(' expr ')' ';'
 *                   | FOR '(' expression_stmt expression_stmt ')' stmt
 *                   | FOR '(' expression_stmt expression_stmt expr ')' stmt
 *                   | FOR '(' declaration expression_stmt ')' stmt
 *                   | FOR '(' declaration expression_stmt expr ')' stmt
 * */
export function iteration_stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'iteration_stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, 'WHILE');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = expr(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ')');
      if(child_4) child_5 = stmt(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      var child_7 = null;
      child_1 = TERMINAL(token_stream, arrow, 'DO');
      if(child_1) child_2 = stmt(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, 'WHILE');
      if(child_3) child_4 = TERMINAL(token_stream, arrow, '(');
      if(child_4) child_5 = expr(token_stream, arrow);
      if(child_5) child_6 = TERMINAL(token_stream, arrow, ')');
      if(child_6) child_7 = TERMINAL(token_stream, arrow, ';');
      if(child_7) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
        node['children'].push(child_7);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      child_1 = TERMINAL(token_stream, arrow, 'FOR');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = expression_stmt(token_stream, arrow);
      if(child_3) child_4 = expression_stmt(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, ')');
      if(child_5) child_6 = stmt(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      var child_7 = null;
      child_1 = TERMINAL(token_stream, arrow, 'FOR');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = expression_stmt(token_stream, arrow);
      if(child_3) child_4 = expression_stmt(token_stream, arrow);
      if(child_4) child_5 = expr(token_stream, arrow);
      if(child_5) child_6 = TERMINAL(token_stream, arrow, ')');
      if(child_6) child_7 = stmt(token_stream, arrow);
      if(child_7) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
        node['children'].push(child_7);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      child_1 = TERMINAL(token_stream, arrow, 'FOR');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = declaration(token_stream, arrow);
      if(child_3) child_4 = expression_stmt(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, ')');
      if(child_5) child_6 = stmt(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      var child_7 = null;
      child_1 = TERMINAL(token_stream, arrow, 'FOR');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = declaration(token_stream, arrow);
      if(child_3) child_4 = expression_stmt(token_stream, arrow);
      if(child_4) child_5 = expr(token_stream, arrow);
      if(child_5) child_6 = TERMINAL(token_stream, arrow, ')');
      if(child_6) child_7 = stmt(token_stream, arrow);
      if(child_7) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
        node['children'].push(child_7);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * jump_stmt -> GOTO IDENTIFIER ';'
 *            | CONTINUE ';'
 *            | BREAK ';'
 *            | RETURN ';'
 *            | RETURN expr ';'
 * */
export function jump_stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'jump_stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'GOTO');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ';');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'CONTINUE');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ';');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'BREAK');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ';');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'RETURN');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ';');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'RETURN');
      if(child_1) child_2 = expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ';');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   labeled_stmt -> IDENTIFIER ':' stmt
 *                 | CASE constant_expr ':' stmt
 *                 | DEFAULT ':' stmt
 * */
export function labeled_stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'labeled_stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ':');
      if(child_2) child_3 = stmt(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, 'CASE');
      if(child_1) child_2 = constant_expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ':');
      if(child_3) child_4 = stmt(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'DEFAULT');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ':');
      if(child_2) child_3 = stmt(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * logical_and_expr -> inclusive_or_expr logical_and_expr_p
 * */
export function logical_and_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'logical_and_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = inclusive_or_expr(token_stream, arrow);
      if(child_1) child_2 = logical_and_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   logical_and_expr_p -> AND_OP inclusive_or_expr logical_and_expr_p
 *                       | EPSILON
 * */
export function logical_and_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'logical_and_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'AND_OP');
      if(child_1) child_2 = inclusive_or_expr(token_stream, arrow);
      if(child_2) child_3 = logical_and_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * logical_or_expr -> logical_and_expr logical_or_expr_p
 * */
export function logical_or_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'logical_or_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = logical_and_expr(token_stream, arrow);
      if(child_1) child_2 = logical_or_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   logical_or_expr_p -> OR_OP logical_and_expr logical_or_expr_p
 *                      | EPSILON
 * */
export function logical_or_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'logical_or_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'OR_OP');
      if(child_1) child_2 = logical_and_expr(token_stream, arrow);
      if(child_2) child_3 = logical_or_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * multiplicative_expr -> cast_expr multiplicative_expr_p
 * */
export function multiplicative_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'multiplicative_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = cast_expr(token_stream, arrow);
      if(child_1) child_2 = multiplicative_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   multiplicative_expr_p -> '*' cast_expr multiplicative_expr_p
 *                          | '/' cast_expr multiplicative_expr_p
 *                          | '%' cast_expr multiplicative_expr_p
 *                          | EPSILON
 * */
var multiplicative_expr_p = function(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'multiplicative_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '*');
      if(child_1) child_2 = cast_expr(token_stream, arrow);
      if(child_2) child_3 = multiplicative_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '/');
      if(child_1) child_2 = cast_expr(token_stream, arrow);
      if(child_2) child_3 = multiplicative_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '%');
      if(child_1) child_2 = cast_expr(token_stream, arrow);
      if(child_2) child_3 = multiplicative_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
};

/*
 * parameter_declaration -> declaration_specifiers declarator
 *                        | declaration_specifiers abstract_declarator
 *                        | declaration_specifiers
 * */
export function parameter_declaration(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'parameter_declaration';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) child_2 = declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) child_2 = abstract_declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = declaration_specifiers(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * parameter_list -> parameter_declaration parameter_list_p
 * */
export function parameter_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'parameter_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = parameter_declaration(token_stream, arrow);
      if(child_1) child_2 = parameter_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   parameter_list_p -> ',' parameter_declaration parameter_list_p
 *                     | EPSILON
 * */
export function parameter_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'parameter_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = parameter_declaration(token_stream, arrow);
      if(child_2) child_3 = parameter_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  parameter_type_list -> parameter_list ',' ELLIPSIS
 *                       | parameter_list
 * */
export function parameter_type_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'parameter_type_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = parameter_list(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ',');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, 'ELLIPSIS');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = parameter_list(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   parameter_list_p -> ',' parameter_declaration parameter_list_p
 *                     | EPSILON
 * */
export function parameter_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'parameter_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, ',');
      if(child_1) child_2 = parameter_declaration(token_stream, arrow);
      if(child_2) child_3 = parameter_list_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  pointer -> '*' type_qualifier_list pointer
 *           | '*' type_qualifier_list
 *           | '*' pointer
 *           | '*'
 * */
export function pointer(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'pointer';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '*');
      if(child_1) child_2 = type_qualifier_list(token_stream, arrow);
      if(child_2) child_3 = pointer(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, '*');
      if(child_1) child_2 = type_qualifier_list(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, '*');
      if(child_1) child_2 = pointer(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '*');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  postfix_expr -> primary_expr postfix_expr_p
 *                | '(' type_name ')' '{' initializer_list '}' postfix_expr_p
 *                | '(' type_name ')' '{' initializer_list ',' '}' postfix_expr_p
 * */
export function postfix_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'postfix_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = primary_expr(token_stream, arrow);
      if(child_1) child_2 = postfix_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      var child_7 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = type_name(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = TERMINAL(token_stream, arrow, '{');
      if(child_4) child_5 = initializer_list(token_stream, arrow);
      if(child_5) child_6 = TERMINAL(token_stream, arrow, '}');
      if(child_6) child_7 = postfix_expr_p(token_stream, arrow);
      if(child_7) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
        node['children'].push(child_7);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      var child_7 = null;
      var child_8 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = type_name(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = TERMINAL(token_stream, arrow, '{');
      if(child_4) child_5 = initializer_list(token_stream, arrow);
      if(child_5) child_6 = TERMINAL(token_stream, arrow, ',');
      if(child_6) child_7 = TERMINAL(token_stream, arrow, '}');
      if(child_7) child_8 = postfix_expr_p(token_stream, arrow);
      if(child_8) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
        node['children'].push(child_7);
        node['children'].push(child_8);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  postfix_expr_p -> '[' expr ']' postfix_expr_p
 *                  | '(' ')' postfix_expr_p
 *                  | '(' argument_expr_list ')' postfix_expr_p
 *                  | '.' IDENTIFIER postfix_expr_p
 *                  | PTR_OP IDENTIFIER postfix_expr_p
 *                  | INC_OP postfix_expr_p
 *                  | DEC_OP postfix_expr_P
 *                  | EPSILON
 * */
export function postfix_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'postfix_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '[');
      if(child_1) child_2 = expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ']');
      if(child_3) child_4 = postfix_expr_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ')');
      if(child_2) child_3 = postfix_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = argument_expr_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) child_4 = postfix_expr_p(token_stream, arrow);
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '.');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = postfix_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'PTR_OP');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = postfix_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'INC_OP');
      if(child_1) child_2 = postfix_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'DEC_OP');
      if(child_1) child_2 = postfix_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  primary_expr -> IDENTIFIER
 *                | CONSTANT
 *                | STRING_LITERAL
 *                | '(' expr ')'
 * */
export function primary_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'primary_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'CONSTANT');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'STRING_LITERAL');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '(');
      if(child_1) child_2 = expr(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ')');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * relational_expr -> shift_expr relational_expr_p
 * */
export function relational_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'relational_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = shift_expr(token_stream, arrow);
      if(child_1) child_2 = relational_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   relational_expr_p -> '<' shift_expr relational_expr_p
 *                      | '>' shift_expr relational_expr_p
 *                      | LE_OP shift_expr relational_expr_p
 *                      | GE_OP shift_expr relational_expr_p
 *                      | EPSILON
 * */
export function relational_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'relational_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '<');
      if(child_1) child_2 = shift_expr(token_stream, arrow);
      if(child_2) child_3 = relational_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, '>');
      if(child_1) child_2 = shift_expr(token_stream, arrow);
      if(child_2) child_3 = relational_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'LE_OP');
      if(child_1) child_2 = shift_expr(token_stream, arrow);
      if(child_2) child_3 = relational_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'GE_OP');
      if(child_1) child_2 = shift_expr(token_stream, arrow);
      if(child_2) child_3 = relational_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  selection_stmt -> IF '(' expr ')' stmt ELSE stmt
 *                  | IF '(' expr ')' stmt
 *                  | SWITCH '(' expr ')' stmt
 * */
export function selection_stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'selection_stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      var child_6 = null;
      var child_7 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IF');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = expr(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ')');
      if(child_4) child_5 = stmt(token_stream, arrow);
      if(child_5) child_6 = TERMINAL(token_stream, arrow, 'ELSE');
      if(child_6) child_7 = stmt(token_stream, arrow);
      if(child_7) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
        node['children'].push(child_6);
        node['children'].push(child_7);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IF');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = expr(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ')');
      if(child_4) child_5 = stmt(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = TERMINAL(token_stream, arrow, 'SWITCH');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = expr(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ')');
      if(child_4) child_5 = stmt(token_stream, arrow);
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * shift_expr -> additive_expr shift_expr_p
 * */
export function shift_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'shift_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = additive_expr(token_stream, arrow);
      if(child_1) child_2 = shift_expr_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   shift_expr_p -> LEFT_OP additive_expr shift_expr_p
 *                 | RIGHT_OP additive_expr shift_expr_p
 *                 | EPSILON
 * */
export function shift_expr_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'shift_expr_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'LEFT_OP');
      if(child_1) child_2 = additive_expr(token_stream, arrow);
      if(child_2) child_3 = shift_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = TERMINAL(token_stream, arrow, 'RIGHT_OP');
      if(child_1) child_2 = additive_expr(token_stream, arrow);
      if(child_2) child_3 = shift_expr_p(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  specifier_qualifier_list -> type_specifier specifier_qualifier_list
 *                            | type_specifier
 *                            | type_qualifier specifier_qualifier_list
 *                            | type_qualifier
 * */
export function specifier_qualifier_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'specifier_qualifier_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = type_specifier(token_stream, arrow);
      if(child_1) child_2 = specifier_qualifier_list(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = type_specifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = type_qualifier(token_stream, arrow);
      if(child_1) child_2 = specifier_qualifier_list(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = type_qualifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  stmt -> labeled_stmt
 *        | compound_stmt
 *        | expression_stmt
 *        | selection_stmt
 *        | iteration_stmt
 *        | jump_stmt
 * */
export function stmt(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'stmt';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = labeled_stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = compound_stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = expression_stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = selection_stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = iteration_stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = jump_stmt(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  storage_class_specifier -> TYPEDEF
 *                           | EXTERN
 *                           | STATIC
 *                           | AUTO
 *                           | REGISTER
 * */
export function storage_class_specifier(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'storage_class_specifier';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'TYPEDEF');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'EXTERN');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'STATIC');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'AUTO');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'REGISTER');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * struct_declaration -> specifier_qualifier_list struct_declarator_list ';'
 * */
export function struct_declaration(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_declaration';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = specifier_qualifier_list(token_stream, arrow);
      if(child_1) child_2 = struct_declarator_list(token_stream, arrow);
      if(child_2) child_3 = TERMINAL(token_stream, arrow, ';');
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  struct_declaration_list -> struct_declaration struct_declaration_list_p
 * */
export function struct_declaration_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_declaration_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = struct_declaration(token_stream, arrow);
      if(child_1) child_2 = struct_declaration_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  struct_declaration_list_p -> struct_declaration struct_declaration_list_p
 *                             | EPSILON
 * */
export function struct_declaration_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_declaration_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = struct_declaration(token_stream, arrow);
      if(child_1) child_2 = struct_declaration_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  struct_declarator -> declarator ':' constant_expr
 *                     | ':' constant_expr
 *                     | declarator
 * */
export function struct_declarator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_declarator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      child_1 = declarator(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, ':');
      if(child_2) child_3 = constant_expr(token_stream, arrow);
      if(child_3) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, ':');
      if(child_1) child_2 = constant_expr(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = declarator(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * struct_declarator_list -> struct_declarator struct_declarator_list_p
 * */
export function struct_declarator_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_declarator_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = struct_declarator(token_stream, arrow);
      if(child_1) child_2 = struct_declarator_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   struct_declarator_list_p -> struct_declarator struct_declarator_list_p
 *                             | EPSILON
 * */
export function struct_declarator_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_declarator_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, '&');
      if(child_1) child_2 = struct_declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  struct_or_union -> STRUCT
 *                   | UNION
 * */
export function struct_or_union(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_or_union';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'STRUCT');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'UNION');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  struct_or_union_specifier -> struct_or_union IDENTIFIER '{' struct_declaration_list '}'
 *                             | struct_or_union '{' struct_declaration_list '}'
 *                             | struct_or_union IDENTIFIER
 * */
export function struct_or_union_specifier(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'struct_or_union_specifier';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      var child_5 = null;
      child_1 = struct_or_union(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) child_3 = TERMINAL(token_stream, arrow, '{');
      if(child_3) child_4 = struct_declaration_list(token_stream, arrow);
      if(child_4) child_5 = TERMINAL(token_stream, arrow, '}');
      if(child_5) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
        node['children'].push(child_5);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = struct_or_union(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '{');
      if(child_2) child_3 = struct_declaration_list(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, '}');
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = struct_or_union(token_stream, arrow);
      if(child_1) child_2 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   translation_unit -> external_declaration translation_unit_p
 * */
export function translation_unit(token_stream, arrow) {
  var new_node = {},
    child_1 = null,
    child_2 = null;
  var new_arrow = Util.clone(arrow);

  new_node['title'] = 'translation_unit';
  new_node['children'] = [];

  child_1 = external_declaration(token_stream, new_arrow);
  if(child_1) child_2 = translation_unit_p(token_stream, new_arrow);
  if(child_1 && child_2) {
    new_node['children'].push(child_1);
    new_node['children'].push(child_2);
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *   translation_unit_p -> external_declaration translation_unit_p
 *                       | EPSILON
 * */
export function translation_unit_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'translation_unit_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = external_declaration(token_stream, arrow);
      if(child_1) child_2 = translation_unit_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  type_name -> specifier_qualifier_list abstract_declarator
 *             | specifier_qualifier_list
 *             | IDENTIFIER abstract_declarator
 *             | IDENTIFIER
 * */
export function type_name(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'type_name';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = specifier_qualifier_list(token_stream, arrow);
      if(child_1) child_2 = abstract_declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = specifier_qualifier_list(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) child_2 = abstract_declarator(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IDENTIFIER');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  type_qualifier -> CONST
 *                  | VOLATILE
 *                  | RESTRICT
 * */
export function type_qualifier(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'type_qualifier';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'CONST');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'VOLATILE');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'RESTRICT');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  type_qualifier_list -> type_qualifier type_qualifier_list_p
 *
 * */
export function type_qualifier_list(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'type_qualifier_list';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = type_qualifier(token_stream, arrow);
      if(child_1) child_2 = type_qualifier_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  type_qualifier_list_p -> type_qualifier type_qualifier_list_p
 *                         | EPSILON
 *
 * */
export function type_qualifier_list_p(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'type_qualifier_list_p';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = type_qualifier(token_stream, arrow);
      if(child_1) child_2 = type_qualifier_list_p(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = EPSILON(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  type_specifier -> VOID
 *                  | CHAR
 *                  | SHORT
 *                  | INT
 *                  | LONG
 *                  | FLOAT
 *                  | DOUBLE
 *                  | SIGNED
 *                  | UNSIGNED
 *                  | BOOL
 *                  | COMPLEX
 *                  | IMAGINARY
 *                  | struct_or_union_specifier
 *                  | enum_specifier
 *
 * */
export function type_specifier(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'type_specifier';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'VOID');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'CHAR');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'SHORT');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'INT');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'LONG');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'FLOAT');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'DOUBLE');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'SIGNED');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'UNSIGNED');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'BOOL');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'COMPLEX');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, 'IMAGINARY');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = struct_or_union_specifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = enum_specifier(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 * unary_expr -> postfix_expr
 *             | INC_OP unary_expr
 *             | DEC_OP unary_expr
 *             | unary_operator cast_expr
 *             | SIZEOF unary_expr
 *             | SIZEOF '(' type_name ')'
 * */
export function unary_expr(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'unary_expr';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = postfix_expr(token_stream, arrow);
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'INC_OP');
      if(child_1) child_2 = unary_expr(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'DEC_OP');
      if(child_1) child_2 = unary_expr(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = unary_operator(token_stream, arrow);
      if(child_1) child_2 = cast_expr(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      child_1 = TERMINAL(token_stream, arrow, 'SIZEOF');
      if(child_1) child_2 = unary_expr(token_stream, arrow);
      if(child_2) {
        node['children'].push(child_1);
        node['children'].push(child_2);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      var child_2 = null;
      var child_3 = null;
      var child_4 = null;
      child_1 = TERMINAL(token_stream, arrow, 'SIZEOF');
      if(child_1) child_2 = TERMINAL(token_stream, arrow, '(');
      if(child_2) child_3 = type_name(token_stream, arrow);
      if(child_3) child_4 = TERMINAL(token_stream, arrow, ')');
      if(child_4) {
        node['children'].push(child_1);
        node['children'].push(child_2);
        node['children'].push(child_3);
        node['children'].push(child_4);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

/*
 *  unary_operator -> '&'
 *                  | '*'
 *                  | '+'
 *                  | '-'
 *                  | '~'
 *                  | '!'
 * */
export function unary_operator(token_stream, arrow) {
  var new_node = {};
  var new_arrow = Util.clone(arrow);
  new_node['title'] = 'unary_operator';
  new_node['children'] = [];
  var list_of_rules = [
    function(token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '&');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '*');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '+');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '-');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '~');
      if(child_1) {
        node['children'].push(child_1);
      }
    },
    function (token_stream, arrow, node) {
      var child_1 = null;
      child_1 = TERMINAL(token_stream, arrow, '!');
      if(child_1) {
        node['children'].push(child_1);
      }
    }
  ];
  iterate_over_rules(token_stream, new_arrow, list_of_rules, new_node);
  if(new_node['children'].length > 0) {
    arrow['pointer'] = new_arrow['pointer'];
    return new_node;
  } else {
    return null;
  }
}

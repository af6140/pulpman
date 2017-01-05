/*global module*/
  //private methods
function pm_parse_rpm_evra (evra) {
  var specs = evra.split('-');
  var result = {
    "epoch": specs[0],
    "version": specs[1],
    "release": specs[2],
    "arch": specs[3]
  };
  return result;
}

function pm_parse_label (label) {
  var label_regex = /[0-9]+|[a-zA-Z]+/g;
  var elements = label.match(label_regex); //array of components only consecutive numbers and letters
  //console.log("elements:", elements)
  return elements;
}

function pm_cmp_element(ea, eb) {
  var ea_isNumber = Number.parseInt(ea) ? true : false;
  var eb_isNumber = Number.parseInt(eb) ? true : false;

  if (ea_isNumber) {
    if (eb_isNumber) {
      var ea_i = Number.parseInt(ea);
      var eb_i = Number.parseInt(eb);
      if (ea_i > eb_i) {
        return 1;
      } else if (ea_i === eb_i) {
        return 0;
      } else {
        return -1;
      }
    } else {
      return 1;
    }
  } else { // ea is not a number
    if (eb_isNumber) {
      return -1;
    } else { //eb is not a number
      return ea < eb ? -1 : (ea > eb ? 1 : 0);
    }
  }
}

function pm_compare_labels(vs_a, vs_b) {
  var v_a = pm_parse_label(vs_a);
  var v_b = pm_parse_label(vs_b);
  var max_loop = Math.min(v_a.length, v_b.length);
  for (var i = 0; i < max_loop; i++) {
    if (pm_cmp_element(v_a[i], v_b[i]) === 1) {
      return 1;
    } else if (pm_cmp_element(v_a[i], v_b[i]) === -1) {
      return -1;
    }
  }
  if (v_a.length > v_b.length) {
    return 1;
  } else if (v_a.length < v_b.length) {
    return -1;
  } else {
    return 0;
  }
}

function compare_rpm_vr(a, b) {
  var a_specs = a.split("-");
  var b_specs = b.split("-");
  //var a_epoch = a_specs[0];
  //var b_epoch = b_specs[0];
  var a_version = a_specs[1];
  var b_version = b_specs[1];
  var a_release = a_specs[2];
  var b_release = b_specs[2];
  var v_compare = pm_compare_labels(a_version, b_version);
  if (v_compare === 1) {
    return 1;
  } else if (v_compare === -1) {
    return -1;
  } else {
    var b_compare = pm_compare_labels(a_release, b_release);
    if (b_compare === 1) {
      return 1;
    } else if (b_compare === -1) {
      return -1;
    } else {
      return 0;
    }
  }
}
// pubblic method
module.exports = {
  cmp: compare_rpm_vr
};

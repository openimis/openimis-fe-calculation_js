export function parseBool(str) {

    if (str.length == null) {
      return str == 1 ? true : false;
    } else {
      return str == "true" ? true : false;
    }
  
}

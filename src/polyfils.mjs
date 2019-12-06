export function flat(array) {
  if (typeof array !== "object") {
    return array;
  } else
    for (let index in array) {
      const entry = array[index];
      if (entry && entry.constructor && entry.constructor.name === "Array") {
        for (let value of entry) {
          array.push(value);
        }
        array.splice(index, 1);
        array = flat(array);
      }
    }
  return array;
}

export class Integer extends Number {
  constructor(value) {
    super(value);
    if (value % 1 !== 0) {
      let stringValue = Number(value).toString();
      stringValue = stringValue.slice(0, stringValue.indexOf("."));
      return new Number(stringValue);
    } else {
      return this.value;
    }
  }
}

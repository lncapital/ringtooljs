const toCamelCase = text => {

  return text

    .replace(/(?:^\w|[A-Z]|\b\w)/g, (leftTrim, index) =>

      index === 0 ? leftTrim.toLowerCase() : leftTrim.toUpperCase(),

    )

    .replace(/\s+/g, "");

};


const separator = (numb) => {
  var str = numb.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}



const reorderPubkeys = (pubkey_array, nodes_own_pubkey) => {
  let reordered_pubkeys_first_part = [];
  let reordered_pubkeys_second_part = [];
  let reorderd_pubkeys = [];
  let begin_index = 0;



  for (let i = 0; i < pubkey_array.length; i++) {

  
    if (  pubkey_array[i].split(',')[0] == nodes_own_pubkey) {


      reordered_pubkeys_first_part = pubkey_array.slice((i) % pubkey_array.length, pubkey_array.length)
      reordered_pubkeys_second_part = pubkey_array.slice(begin_index, (i) % pubkey_array.length)
      reorderd_pubkeys = [...reordered_pubkeys_first_part, ...reordered_pubkeys_second_part]
      break;

    }

  }

  return reorderd_pubkeys;

}


module.exports = {
  toCamelCase,
  separator,
  reorderPubkeys
};


export function prepareNamespace(hash: string, setLocation: boolean) {
  let ns = hash.replace(/^#/, ""); // remove # from the hash
  if (/^[0-9]{7}$/.test(ns)) {
    console.log("Checked existing namespace", ns);
    return ns;
  }
  ns = Math.random().toString().substring(2, 9);
  console.log("Created new namespace", ns);
  if (setLocation) {
    window.location.hash = ns;
  }
  return ns;
}

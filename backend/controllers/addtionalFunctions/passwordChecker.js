const generateStrongPassword = (length) => {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbols = '#$%^&*';
  const allCharacters = lowerCase + upperCase + digits + symbols;
  let password = '';

  // Ensure the password has at least one lowercase, one uppercase, one digit, and one symbol
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the remaining characters with random choices from allCharacters
  for (let i = 4; i < length; i++) {
    password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
  }

  // Shuffle the password to ensure randomness
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
};




const passwordChecker = (password) => {
  const n = password.length;
  const strongPassword = generateStrongPassword(15)

  // Check for missing requirements
  let hasLower = false, hasUpper = false, hasDigit = false;
  for (let i = 0; i < n; i++) {
    if (/[a-z]/.test(password[i])) hasLower = true;
    if (/[A-Z]/.test(password[i])) hasUpper = true;
    if (/\d/.test(password[i]))    hasDigit = true;
  }

  const missingTypes = (!hasLower ? 1 : 0) + (!hasUpper ? 1 : 0) + (!hasDigit ? 1 : 0);

  let toBeReplaced = 0;
  let oneMod = 0, twoMod = 0, toBeRemoved = 0;

  // 2 to avoid undefined values 
  let i = 2;
  while (i < n) {
    //  three caracter in a row (e.g.  aaa )
    if (password[i] === password[i - 1] && password[i - 1] === password[i - 2]) {
      let length = 2;
      while (i < n && password[i] === password[i - 1]) {
        length++;
        i++;
      }
      // how many replacing we need to break the sequence down
      toBeReplaced += Math.floor(length / 3);
      if (length % 3 === 0) oneMod++;
      else if (length % 3 === 1) twoMod++;
    } else {
      i++;
    }
  }

  if (n < 6) {
    // considering the requirements
    let message = 'Password is too short and/or need replacement Ensure it contain A a 1'
    return {result: Math.max(6 - n, missingTypes), message:message , recommended:strongPassword}
  } else if (n <= 20) {
    // check for missing types
    let message = 'acceptable length but it may need replacement Ensure not aaa or ccc'
    return {result: Math.max(missingTypes, toBeReplaced), message:message, recommended:strongPassword}
  } else {
    toBeRemoved = n - 20;

    if (toBeRemoved <= oneMod * 1) {
      toBeReplaced -= Math.floor(toBeRemoved / 1);
    } else if (toBeRemoved - oneMod * 1 <= twoMod * 2) {
      toBeReplaced -= Math.floor((toBeRemoved - oneMod * 1) / 2) + oneMod;
    } else {
      toBeReplaced -= Math.floor((toBeRemoved - oneMod * 1 - twoMod * 2) / 3) + oneMod + twoMod;
    }

    let message = 'Password is too long with possible replacement'
    return {result:  Math.ceil(toBeRemoved + Math.max(missingTypes, toBeReplaced)), message:message,recommended:strongPassword}
  }
}


export default passwordChecker

// console.log(passwordChecker("a")); 
// console.log(passwordChecker("aA1")); 
// console.log(passwordChecker("1337C0d3"));
// console.log(passwordChecker("1111111111")); 
// console.log(passwordChecker("bbaaaaaaaaaaaaaaacccccc")); 

window.leftPad = function(str, len, ch) {
    if (!ch) {
        ch = ' ';
    }

    if ((typeof ch) !== 'string') {
        ch = String(ch);
    }

    let resultStr = '';

    for (let i = 0; i < len; i++) {
        resultStr += ch;
    }

    return resultStr + str;
}
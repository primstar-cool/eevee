module.exports = function replaceRpx2Rem(string) {
    return string.replace(/([\d\.]+)rpx/g, (m, r) => {
      return r / 100 + 'rem';
    });
  }
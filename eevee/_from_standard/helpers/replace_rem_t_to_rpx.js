module.exports = function (screenWidthRem = 7.5) {

    return 

        function replaceRem2Rpx(string) {

            return string.replace(/([\d\.]+)rem/g, (m, r) => {
              return Math.round(r * 100000)/(10 * 750 / screenWidthRem) + 'rpx';
            });
          }
          
    }

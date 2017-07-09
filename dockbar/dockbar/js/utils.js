var utils  = {
    dynamicSort: function(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },
    arraySort: function(pArray) {
        pArray.sort(
          function(a,b)
          {
            var len=a.length;
            for (var i=0;i<len;i++)
            {
              if (a[i]>b[i]) return 1;
              else if (a[i]<b[i]) return -1;
            }
            return 0;
          }
        );

        return pArray;
    }
}
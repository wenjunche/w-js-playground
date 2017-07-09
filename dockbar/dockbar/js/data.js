var service = {

    benchmarkResponse: 500,
    legendButtonTitle: 'Show All',
    SLAMain: {},
    SLADetail: {},
    ExceptionDetails: {},
    CDDSRequestsConsumerBreakdown: {},
    
    getLocal: function(file, callback) {
        $.getJSON( "data/" + file  + ".json", function( data ) {
            service[file] = [];
            
            $.each( data, function( key, val ) {                
                
                service[file].push( val );
                
                var date = String(val.Day);
                var y = date.substring(0, 4);
                var m = date.substring(4, 6);
                var d = date.substring(6, 8);
                
                val.date = new Date(parseInt(y), parseInt(m), parseInt(d), parseInt(val.Hour));
                
            });
            
            callback();
        });
    },

    getRemote: function(op, params, callback) {
        var data = {
                startDayYYYYMMDD: 20140311,
                endDayYYYYMMDD: 20140415
            };

        console.log("REMOTE", op, params);
        
        if (op === 'CDDSRequestsConsumerBreakdown')
            data.assetClass = params;
        else if (op === 'Attributes')
            data.limit = params;
        else
            data.region = params;

        var req = $.ajax( { 
            url: "http://infusionnucleus.cloudapp.net/DataWebService/DataWS.asmx/Get" + op, 
            type: "POST",
            data: data,
            async: true,
            success: function( data ) {
                
                data = data.replace('<?xml version="1.0" encoding="utf-8"?>', '');
                data = data.replace('<string xmlns="http://tempuri.org/">', '');
                data = data.replace('</string>', '');
                
                data = JSON.parse(data);
                console.log("SUCCESS", data);
                
                if (op === 'CDDSRequestsConsumerBreakdown') {
                    if (!$.isArray(service[op])) 
                        service[op] = [];
                } else {
                    service[op] = [];
                }

                $.each(data, function(key, val) {
                    service[op].push( val );
                    
                    var date = String(val.Day);
                    var y = date.substring(0, 4);
                    var m = date.substring(4, 6) - 1;
                    var d = date.substring(6, 8);
                    
                    val.date = new Date(parseInt(y), parseInt(m), parseInt(d), parseInt(val.Hour));
                });
                
                callback();
            },
            error: function( e ) {
                console.log(e);
            },
            dataType: "text"
        }); 
    },

    getResponseTimes: function(region) {
        var data = [];

        for (var i = 0; i < service.SLADetail.length; i++) {
            if (service.SLADetail[i].Region.toLowerCase() == region.toLowerCase()) {
                var date = service.SLADetail[i].date.getTime();
                if (data.indexOf(date) === -1) data.push(date);
            }
        }

        return data;
    },

    getActivityTimes: function(region) {
        var data = [];

        for (var i = 0; i < service.CDDSRequestsConsumerBreakdown.length; i++) {
            var date = service.CDDSRequestsConsumerBreakdown[i].date.getTime();
            if (data.indexOf(date) === -1) data.push(date);
        }

        return data;
    },

    getResponseTimeData: function(region) {
        var data = [];
        for (var i = 0; i < service.SLAMain.length; i++) {
            if (service.SLAMain[i].Region.toLowerCase() == region.toLowerCase()) {
                var date = service.SLAMain[i].date.getTime();
                var min = service.SLAMain[i].MinResponseTime;
                var max = service.SLAMain[i].MaxResponseTime;
                data.push([date, min, max]);
            }
        }
        return data;
    },

    getConsumerTimeData: function(region, times) {
        var consumers = [],
            data = [];

        for (var i = 0; i < service.SLADetail.length; i++) {
            var consumer = service.SLADetail[i].Consumer;

            if (consumers.indexOf(consumer) === -1) consumers.push(consumer);
        }

        for (var i = 0; i < consumers.length; i++) {
            var consumerObj = {
                'name': consumers[i],
                'data': []
            }

            for (var j = 0; j < times.length; j++) {
                for (var k = 0; k < service.SLADetail.length; k++) {
                    var date = service.SLADetail[k].date.getTime();

                    if (service.SLADetail[k].Consumer === consumers[i] && date === times[j]) {
                        var min = service.SLADetail[k].MinResponseTime,
                            max = service.SLADetail[k].MaxResponseTime;

                        consumerObj.data.push([times[j], min, max]);
                    }
                }
            }

            utils.arraySort(consumerObj.data);

            data.push(consumerObj);
        }

        return data;
    },

    getConsumerActivityData: function(region, times) {
        var consumers = [],
            consumersMap = {},
            data = [];

        for (var i = 0; i < service.CDDSRequestsConsumerBreakdown.length; i++) {
            var consumer = service.CDDSRequestsConsumerBreakdown[i].Consumer;

            if (consumers.indexOf(consumer) === -1) consumers.push(consumer);
        }

        for (var i = 0; i < consumers.length; i++) {
            var consumerObj = {
                'name': consumers[i],
                'data': []
            }

            for (var j = 0; j < times.length; j++) {
                for (var k = 0; k < service.CDDSRequestsConsumerBreakdown.length; k++) {
                    var date = service.CDDSRequestsConsumerBreakdown[k].date.getTime();

                    if (service.CDDSRequestsConsumerBreakdown[k].Consumer === consumers[i] && date === times[j]) {
                        var sAC = service.CDDSRequestsConsumerBreakdown[k].AssetClass,
                            sC = service.CDDSRequestsConsumerBreakdown[k].Consumer,
                            sD = date,
                            consumerKey = sAC + sC + sD,
                            y = service.CDDSRequestsConsumerBreakdown[k].Requests;

                        consumersMap[consumerKey] = {};
                        consumersMap[consumerKey].consumer = consumers[i];
                        consumersMap[consumerKey].date = date;
                        consumersMap[consumerKey].min = 0;
                        consumersMap[consumerKey].max = 0;

                        if (service.CDDSRequestsConsumerBreakdown[k].AssetClass === 'FI')
                            consumersMap[consumerKey].max = y;
                        else if (service.CDDSRequestsConsumerBreakdown[k].AssetClass === 'EQ')
                            consumersMap[consumerKey].min = Math.abs(y) * -1;
                    }
                }
            }

            data.push(consumerObj);
        }

        for (var prop in consumersMap) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].name === consumersMap[prop].consumer)
                    data[i].data.push([consumersMap[prop].date, consumersMap[prop].min, consumersMap[prop].max]);
            }
        }

        for (var i = 0; i < data.length; i++) {
            var consumerObj = data[i];

            utils.arraySort(consumerObj.data);
        }
        
        return data;
    },

    getAvgResponseTimes: function(region) {
        var data = [];
        for (var i = 0; i < service.SLAMain.length; i++) {
            if (service.SLAMain[i].Region.toLowerCase() == region.toLowerCase()) {
                var date = service.SLAMain[i].date.getTime();
                var avg = service.SLAMain[i].ResponseTime;
                data.push([date, avg]);
            }
        }
        return data;
    },

    getConsumerDetailsData: function(consumer, date) {
        var data = service.SLADetail,
            dailyDataArr = [],
            currHourData = {
                hourly: {},
                daily: {
                    ResponseTime: 0,
                    MedianResponseTime: 0,
                    MaxResponseTime: 0,
                    MinResponseTime: 0
                }
            },
            fullMonth = ('0' + parseInt(date.getMonth() + 1)).slice(-2),
            fullDate = ('0' + date.getDate()).slice(-2),
            fullDay = date.getFullYear() + fullMonth + fullDate;

        for (var i = 0; i < data.length; i++) {
            if (data[i].Consumer == consumer && data[i].Day == fullDay && data[i].Hour == date.getHours()) {
                currHourData.hourly = data[i];
            }
            if (data[i].Consumer == consumer && data[i].Day == fullDay) {
                dailyDataArr.push(data[i]);
            }
        }

        var weight = 0;

        for (var i = 0; i < dailyDataArr.length; i++) {
            weight += dailyDataArr[i].Requests;
            currHourData.daily.ResponseTime += (dailyDataArr[i].ResponseTime * dailyDataArr[i].Requests);
            currHourData.daily.MedianResponseTime += (dailyDataArr[i].MedianResponseTime * dailyDataArr[i].Requests);
            if (currHourData.daily.MaxResponseTime < dailyDataArr[i].MaxResponseTime) {
                currHourData.daily.MaxResponseTime = dailyDataArr[i].MaxResponseTime;
            }
            if (currHourData.daily.MinResponseTime == 0 || currHourData.daily.MinResponseTime > dailyDataArr[i].MinResponseTime) {
                currHourData.daily.MinResponseTime = dailyDataArr[i].MinResponseTime;
            }
        }

        currHourData.daily.ResponseTime = parseInt(currHourData.daily.ResponseTime / weight);
        currHourData.daily.MedianResponseTime = parseInt(currHourData.daily.MedianResponseTime / weight);

        return currHourData;
    },

    getFiles: function(date) {
        var data = service.Files,
            currDayData = [],
            fullMonth = ('0' + parseInt(date.getMonth() + 1)).slice(-2),
            fullDate = ('0' + date.getDate()).slice(-2),
            fullDay = date.getFullYear() + fullMonth + fullDate;;

        for (var i = 0; i < data.length; i++) {
            if (data[i].Day == fullDay)
                currDayData.push(data[i]);
        }

        return currDayData;
    },

    getActivityDetailsData: function(consumer, visibleConsumers, date) {
        var data = service.CDDSRequestsConsumerBreakdown,
            dailyDataArr = [],
            currHourData = {
                hourly: {},
                daily: {
                    eq: 0,
                    fi: 0
                }
            },
            fullMonth = ('0' + parseInt(date.getMonth() + 1)).slice(-2),
            fullDate = ('0' + date.getDate()).slice(-2),
            fullDay = date.getFullYear() + fullMonth + fullDate;

        for (var i = 0; i < data.length; i++) {
            if (data[i].Consumer == consumer && data[i].Day == fullDay && data[i].Hour == date.getHours()) {
                currHourData.hourly = data[i];
            }
            if (visibleConsumers.indexOf(data[i].Consumer) !== -1 && data[i].Day == fullDay) {
                dailyDataArr.push(data[i]);
            }
        }

        for (var i = 0; i < dailyDataArr.length; i++) {
            if (dailyDataArr[i].AssetClass === "EQ")
                currHourData.daily.eq += dailyDataArr[i].Requests;
            else if (dailyDataArr[i].AssetClass === "FI")
                currHourData.daily.fi += dailyDataArr[i].Requests;
        }

        return currHourData;
    },

    getNewInstrumentsData: function(date) {
        var data = service.NewInstruments,
            currHourData = {
                hourly: {
                    total: 0,
                    EQ: 0,
                    FI: 0
                },
                daily: {
                    total: 0,
                    EQ: 0,
                    FI: 0
                }
            },
            fullMonth = ('0' + parseInt(date.getMonth() + 1)).slice(-2),
            fullDate = ('0' + date.getDate()).slice(-2),
            fullDay = date.getFullYear() + fullMonth + fullDate;

        for (var i = 0; i < data.length; i++) {
            if (data[i].Day == fullDay && data[i].Hour == date.getHours()) {
                currHourData.hourly[data[i].AssetClass] = data[i].NewInstruments;
                currHourData.hourly.total += data[i].NewInstruments;
            }
            if (data[i].Day == fullDay) {
                currHourData.daily[data[i].AssetClass] += data[i].NewInstruments;
                currHourData.daily.total += data[i].NewInstruments;
            }
        }

        return currHourData;
    },

    getAttributesData: function(date) {
        var data = service.Attributes,
            currDayData = [],
            fullMonth = ('0' + parseInt(date.getMonth() + 1)).slice(-2),
            fullDate = ('0' + date.getDate()).slice(-2),
            fullDay = date.getFullYear() + fullMonth + fullDate;;

        for (var i = 0; i < data.length; i++) {
            if (data[i].Day == fullDay)
                currDayData.push(data[i]);
            
            if (currDayData.length === 10)
                break;
        }

        return currDayData;
    }

};
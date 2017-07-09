var ActivityComponent = React.createClass({   
    intialLoadingDate: new Date(2014, 3, 9, 3),  
    initialDateForPlay: null,
    leftmostChartDateForPlay: new Date(2014,2,11,1),
    rightmostChartDateForPlay: new Date(2014,3,14,3),
    deltaIncrementForPlay: 12,
    shouldPlay:false,
    addHours: function(originalDate, h) {
        var date = new Date(originalDate.getFullYear(), originalDate.getMonth(), originalDate.getDate(), originalDate.getHours());    
        date.setTime(date.getTime() + (h*60*60*1000)); 
        return date;   
   },
   
   updatePlayParameters: function(lowerEndDate, upperEndDate)
   {
      this.initialDateForPlay = this.addHours(lowerEndDate, 1);
      this.deltaIncrementForPlay = Math.abs(upperEndDate - lowerEndDate) / 36e5;                
   },
   
   publishHourlyDaily: function(chartSeries, date){
       setTimeout(function(){
           var visibleConsumers = [],
            data = {},
            eqHourlyRequests = 0,
            fiHourlyRequests = 0,  
            eqDaily = 0,
            fiDaily = 0,          
            lastDayData = {},
            lastDayEQ = 0,
            lastDayFI = 0,
            lastEQ = 0,
            lastFI = 0;
       
            for (var i = 0; i < chartSeries.length; i++) {
                if (chartSeries[i].visible)
                    visibleConsumers.push(chartSeries[i].name);
            }    
       
            for (var i = 0; i < visibleConsumers.length; i++) {
                var consumer = visibleConsumers[i];
                data = service.getActivityDetailsData(consumer, visibleConsumers, date);
                lastDayData = service.getActivityDetailsData(consumer, visibleConsumers, new Date(date - 86400000));
                if (data.hourly.AssetClass === "EQ") {
                    eqHourlyRequests += data.hourly.Requests;                
                    eqDaily += data.daily.eq;
                    lastDayEQ += lastDayData.hourly.Requests;
                    lastEQ += lastDayData.daily.eq;
                }                
             else if (data.hourly.AssetClass === "FI") {           
                    fiHourlyRequests += data.hourly.Requests;                
                    fiDaily += data.daily.fi; 
                    lastDayFI += lastDayData.hourly.Requests;
                    lastFI += lastDayData.daily.fi;
                }             
            }  

            fin.desktop.InterApplicationBus.publish('activity-hourly-daily', {          
                eqHourlyRequests: eqHourlyRequests,
                fiHourlyRequests: fiHourlyRequests,
                eqDaily: eqDaily,
                fiDaily: fiDaily,          
                lastDayEQ: lastDayEQ,
                lastDayFI: lastDayFI,
                lastEQ: lastEQ,
                lastFI: lastFI,
                date: date.getTime()       
                });
            }, 100);        
   },
   
   publishNewlyInstrumentsActivity : function(date){
       setTimeout(function(){
          var data = service.getNewInstrumentsData(date),
          lastDayData = service.getNewInstrumentsData(new Date(date - 86400000));
          
          fin.desktop.InterApplicationBus.publish('activity-new-instruments', {          
                data: data,
                lastDayData: lastDayData,          
                date: date.getTime()       
            }); 
       }, 200);            
   },
   
   publishAttributes : function(date){
       var shouldAnimate = !this.shouldPlay;
       setTimeout(function(){
            var data = service.getAttributesData(date);
              fin.desktop.InterApplicationBus.publish('activity-attributes', {          
                data: data,        
                shouldAnimate: shouldAnimate,                   
                date: date.getTime()       
            });    
       }, 300);       
   },   
   
   buildChart: function(times, consumers) {
       var container = this.props.componentId;
       var context = this;      
        $('#' + container).highcharts('StockChart', {

            chart: {
                backgroundColor: '#353a4a',
                type: 'areasplinerange'
            },

            colors: ['#ba5f7d', '#0091b5', '#06546c', '#6fb129', '#fee409', '#f6bd50', '#706547', '#5e6064'],

            credits: {
                enabled: false
            },

            labels: {
                items: [
                    {
                        html: 'EQUITIES',
                        style: {
                            'left': 450 + 'px',
                            'top': '200px'
                        }
                    },
                    {
                        html: 'FIXED INCOME',
                        style: {
                            'left': 450 + 'px',
                            'top': '10px'
                        }
                    }
                ],
                style: {
                    'color': '#fff',
                    'fontWeight': 'bold'
                }
            },

            legend: {
               // align: 'left',
                enabled: true,
                itemHiddenStyle: {
                    'color': '#494c55'
                },
                itemHoverStyle: {
                    'color': '#96979a'
                },
                itemMarginBottom: 15,
                itemStyle: {
                    'color': '#aeafb4',
                    'textTransform': 'uppercase'
                },
                layout: 'horizontal',
                verticalAlign: 'top',
            },

            navigator: {
                handles: {
                    backgroundColor: '#666a74',
                    borderColor: '#191d28'
                },
                height: 50,                
                maskFill: 'rgba(0, 0, 0, 0.25)',
                outlineColor: '#4f5460',
                series: {
                    color: '#5c6c78',
                    fillOpacity: 0.75,
                    lineWidth: 0,
                    type: 'areasplinerange'
                },
                xAxis: {
                    gridLineColor: '#4f5460',
                    gridLineWidth: 1,
                    labels: {
                        style: {
                            color: '#f3f3f3',
                            'background-color': '#262a35'
                        }
                    }
                },
                yAxis: {
                    reversed: true
                }
            },

            plotOptions: {
                areasplinerange: {
                     fillOpacity:0.1,                                   
                    events: {
                        click: function() {
                           // chartManager.currConsumer = this.name;
                        }
                    }
                },
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                var d = new Date(this.x);   
                                var chartSeries = $('#' + container).highcharts().series;
                                context.initialDateForPlay = context.addHours(d, -(context.deltaIncrementForPlay)/2);
                                context.publishHourlyDaily(chartSeries, d);
                                context.publishNewlyInstrumentsActivity(d);
                                context.publishAttributes(d);                                                     
                            }
                        }
                    },
                    marker: {
                        lineWidth: 1
                    }
                }
            },

            rangeSelector: {
                buttons : [{
                    type : 'hour',
                    count : 12,
                    text : '12h'
                }, {
                    type : 'day',
                    count : 1,
                    text : '1D'
                },                
                 {
                    type: 'week',
                    count: 1,
                    text: '1W'
                },
                {
                    type: 'month',
                    count: 1,
                    text: '1M'
                }                
                ],
                buttonTheme: {
                    fill: 'none',
                    stroke: 'none',
                    'stroke-width': 0,
                    r: 2,
                    style: {
                        color: '#b6bfd0',
                        fontWeight: 'bold'
                    },
                    states: {
                        hover: {
                            fill: 'none'
                        },
                        select: {
                            fill: '#262a35',
                            style: {
                                color: '#f3f3f3'
                            }
                        }
                    }
                },
                inputBoxBorderColor: '#b6bfd0',
                inputEnabled: false,
                labelStyle: {
                    'color': '#b6bfd0'
                },                
                selected: 3
            },

            scrollbar: {
                barBackgroundColor: '#666a74',
                barBorderColor: '#4f5460',
                buttonArrowColor: '#191d28',
                buttonBackgroundColor: '#666a74',
                buttonBorderColor: '#4f5460',
                rifleColor: '#191d28',
                trackBackgroundColor: '#7b808c',
                trackBorderColor: '#4f5460'
            },

            series: consumers,

            title: null,

            tooltip: {
                backgroundColor: '#191d28',
                borderRadius: 5,
                borderWidth: 0,
                crosshairs: true,
                formatter: function() {
                    var d = new Date(this.x),
                        s = '<span style="font-weight: bold;">' + moment(d).format("MMMM DD, YYYY hA z") + '</span>';
                        
                    $.each(this.points, function(i, point) {
                        s += '<br/><br/><span style="font-weight: bold; color: ' + point.series.color + '">' + point.series.name + '</span>: ' + Math.abs(point.point.low) + ' FI, ' + point.point.high + ' EQ requests';
                    });
                    
                    return s;
                },
                positioner: function(labelWidth, labelHeight, point) {
                    return {
                        x: 50,
                        y: 40
                    }
                },
                shared: true,
                style: {
                    'color': '#fff'
                }
            },

            xAxis: {
                dateTimeLabelFormats: {
                    day: '%b %e',
                    hour: '%I%P'
                },
                events: {
                    setExtremes: function(e) {
                         var middate = (new Date(e.min).getTime() + new Date(e.max).getTime())/2;                       
                         var lowerEndDate = new Date(e.min);
                         var upperEndDate = new Date(e.max);
                         context.updatePlayParameters(lowerEndDate, upperEndDate);                               
                         var chartSeries = $('#' + container).highcharts().series;
                         var mid = new Date(middate);
                         context.publishHourlyDaily(chartSeries, mid); 
                         context.publishNewlyInstrumentsActivity(mid);
                         context.publishAttributes(mid);                        
                    }                    
                },
                gridLineColor: '#3f4554',
                gridLineWidth: 1,
                labels: {
                    step: 1,
                    style: {
                        'color': '#b6bfd0'
                    }
                },
                lineColor: '#6d717a',
                lineWidth: 2,
                type: 'datetime',
                tickInterval: 3600 * 1000,
                tickLength: 0
            },

            yAxis: {
                gridLineColor: '#4f5460',
                labels: {
                    formatter: function() {
                        return Math.abs(this.value);
                    },
                    style: {
                        'color': '#f3f3f3'
                    }
                },
                opposite: false,
                plotLines: [{
                    color: '#fff',
                    width: 1,
                    value: 0,
                    zIndex: 100
                }],
                title: null
            }
            
        });
    },  
   
   play : function(increment)
   {       
        var initialDate =  this.initialDateForPlay;        
        var finalDate = this.addHours(initialDate, increment);
        
        var cutOffDate = this.addHours(finalDate, 1);            
        if (cutOffDate.getTime() >= this.rightmostChartDateForPlay.getTime())
        {
            initialDate = this.leftmostChartDateForPlay;
            finalDate = this.addHours(initialDate, increment);
        }                         
                      
        $('#' + this.props.componentId).highcharts().xAxis[0].setExtremes(initialDate, finalDate, true, false);        
        
        var deltaNext = 1;
        if (increment > 360)
            deltaNext = 12;
        else if (increment > 180)
            deltaNext = 6;    
        else if (increment > 90)
            deltaNext = 3; 
            
        this.initialDateForPlay = this.addHours(initialDate, deltaNext); 
   },
   
   init: function(){
       $("#loadingImage").hide();
       $("#" + this.props.componentId).show();       
       var times = utils.arraySort(service.getActivityTimes());
       var consumers = service.getConsumerActivityData(null, times);
       this.buildChart(times,consumers);
       
       var container = this.props.componentId;
       
       var leftSideDate = this.intialLoadingDate;
       var rightSideDate =  this.addHours(this.intialLoadingDate, this.deltaIncrementForPlay);
       $('#' + container).highcharts().xAxis[0].setExtremes(leftSideDate, rightSideDate);
        
       var activityComponent = this;
       
       setInterval(function() {   
            if (activityComponent.shouldPlay)     
                activityComponent.play(activityComponent.deltaIncrementForPlay);        
            }, 1000);
   },  
   
   componentDidMount: function(){
       $("#" + this.props.componentId).hide();
       var activityComponent = this;       
       activityServiceCall.subscribeOnReady(this.init);
       finReady.subscribeOnReady(function(){
           fin.desktop.InterApplicationBus.subscribe('*', 'play-activity', function(play){
                activityComponent.shouldPlay = play.play; 
           });    
       });
            
       setTimeout(function() {
		  activityServiceCall.start();
	   }, 1000);     
   },   
   
   render: function(){
       var imageStyle = {
           width : "150px", 
           height : "150px",
           margin : "175px auto",
           display: "block"
       };
       
        return (
           <div>
                <img id="loadingImage" src="img\loading_spinner.gif" style={imageStyle}></img>
                <div className="large-12 columns">   
                    <div id={this.props.componentId} className="activity-graph-container"></div>   
                </div>
            </div>              
    );
  }  
});
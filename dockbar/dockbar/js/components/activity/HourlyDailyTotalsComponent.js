var HourlyDailyTotalsComponent = React.createClass({
   showActivityDetails : function(payload)
   {     
        $("#loadingImage").hide();
        $("#" + this.props.componentId).show();     
         
          var          
            eqHourlyRequests = payload.eqHourlyRequests,
            fiHourlyRequests = payload.fiHourlyRequests,  
            eqDaily = payload.eqDaily,
            fiDaily = payload.fiDaily,         
            lastDayEQ = payload.lastDayEQ,
            lastDayFI = payload.lastDayFI,
            lastEQ = payload.lastEQ,
            lastFI = payload.lastFI,
            hourlySectionEl = $('#'+ this.props.componentId).find('.hourly-section'),
            dailySectionEl = $('#' + this.props.componentId).find('.daily-section');                  
                
        hourlySectionEl.find('.data-eq > .data').text(eqHourlyRequests);
        hourlySectionEl.find('.data-fi > .data').text(fiHourlyRequests);           
               
        if (hourlySectionEl.find('.data-eq > .data').text() > lastDayEQ)
            hourlySectionEl.find('.data-eq > .arrow').removeClass().addClass('arrow up');
        else
            hourlySectionEl.find('.data-eq > .arrow').removeClass().addClass('arrow down');

        if (hourlySectionEl.find('.data-fi > .data').text() > lastDayFI)
            hourlySectionEl.find('.data-fi > .arrow').removeClass().addClass('arrow up');
        else
            hourlySectionEl.find('.data-fi > .arrow').removeClass().addClass('arrow down');


        dailySectionEl.find('.data-eq > .data').text(eqDaily);
        dailySectionEl.find('.data-fi > .data').text(fiDaily);

        if (eqDaily > lastEQ)
            dailySectionEl.find('.data-eq > .arrow').removeClass().addClass('arrow up');
        else
            dailySectionEl.find('.data-eq > .arrow').removeClass().addClass('arrow down');

        if (fiDaily > lastFI)
            dailySectionEl.find('.data-fi > .arrow').removeClass().addClass('arrow up');
        else
            dailySectionEl.find('.data-fi > .arrow').removeClass().addClass('arrow down');
            
       $('#' + this.props.containerId).css({'display': 'inline-block'});
 
   },
   
   componentDidMount: function()
   {   $("#" + this.props.componentId).hide();
       var context = this;
       finReady.subscribeOnReady(function(){      
            fin.desktop.InterApplicationBus.subscribe('*', 'activity-hourly-daily', context.showActivityDetails);
       }); 
   },
   
   render : function()
   {  
       var marginTopStyle = { marginTop: "20px" }; 
       var imageStyle = {
           width : "150px", 
           height : "150px",
           margin : "111px  auto",
           display: "block",
           verticalAlign : "center"
       };     
                                
       return (
              <div>
                <img id="loadingImage" src="img\loading_spinner.gif" style={imageStyle}></img>              
             <div id={this.props.componentId} className="large-3 flex clearfix activity-details-container" style={marginTopStyle}>
                    <div className="details-section hourly-section">
                            <h2 className="section-title">Hourly</h2>
                            <p className="data-eq">
                                <span className="arrow"></span>
                                <span className="data"></span>
                                <span className="tag">EQUITIES</span>
                            </p>
                            <p className="data-fi">
                                <span className="arrow"></span>
                                <span className="data"></span>
                                <span className="tag">FIXED INCOME</span>
                            </p>
                        </div>
                        <div className="details-section daily-section">
                            <h2 className="section-title">Daily</h2>
                            <p className="data-eq">
                                <span className="arrow"></span> 
                                <span className="data"></span>
                                <span className="tag">EQUITIES</span>
                            </p>
                            <p className="data-fi">
                                <span className="arrow"></span>
                                <span className="data"></span>
                                <span className="tag">FIXED INCOME</span>
                            </p>
                        </div>                                               
                                                                        
             </div>
             </div>
         
       );
   } 
});
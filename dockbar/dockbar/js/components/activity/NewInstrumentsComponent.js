var NewInstrumentsComponent = React.createClass({
   showNewInstruments: function(payload){  
     $("#loadingImage").hide();
     $("#" + this.props.componentId).show();     
           
     var data = payload.data,
            lastDayData = payload.lastDayData,
             hourlySectionEl = $('#'+ this.props.componentId).find('.hourly-section'),
            dailySectionEl = $('#' + this.props.componentId).find('.daily-section');
        
        hourlySectionEl.find('.total .data').text(data.hourly.total);
        if (data.hourly.total > lastDayData.hourly.total)
            hourlySectionEl.find('.total .arrow').removeClass().addClass('arrow up')
        else
            hourlySectionEl.find('.total .arrow').removeClass().addClass('arrow down')

        hourlySectionEl.find('.eq .data').text(data.hourly.EQ);
        if (data.hourly.EQ > lastDayData.hourly.EQ)
            hourlySectionEl.find('.eq .arrow').removeClass().addClass('arrow up')
        else
            hourlySectionEl.find('.eq .arrow').removeClass().addClass('arrow down')

        hourlySectionEl.find('.fi .data').text(data.hourly.FI);
        if (data.hourly.FI > lastDayData.hourly.FI)
            hourlySectionEl.find('.fi .arrow').removeClass().addClass('arrow up')
        else
            hourlySectionEl.find('.fi .arrow').removeClass().addClass('arrow down')

        dailySectionEl.find('.total .data').text(data.daily.total);
        if (data.daily.total > lastDayData.daily.total)
            dailySectionEl.find('.total .arrow').removeClass().addClass('arrow up')
        else
            dailySectionEl.find('.total .arrow').removeClass().addClass('arrow down')

        dailySectionEl.find('.eq .data').text(data.daily.EQ);
        if (data.daily.EQ > lastDayData.daily.EQ)
            dailySectionEl.find('.eq .arrow').removeClass().addClass('arrow up')
        else
            dailySectionEl.find('.eq .arrow').removeClass().addClass('arrow down')

        dailySectionEl.find('.fi .data').text(data.daily.FI);
        if (data.daily.FI > lastDayData.daily.FI)
            dailySectionEl.find('.fi .arrow').removeClass().addClass('arrow up')
        else
            dailySectionEl.find('.fi .arrow').removeClass().addClass('arrow down')   
   },
   
   componentDidMount: function()
   {   
       $("#" + this.props.componentId).hide(); 
       var context = this;  
        finReady.subscribeOnReady(function(){   
            fin.desktop.InterApplicationBus.subscribe('*', 'activity-new-instruments', context.showNewInstruments);
        });        
   },
   
   render: function()
   {
       var grandTotalStyle = {width:"160px"};
       var totalStyle = {width: "130px"};
       var marginTopStyle = { marginTop: "25px" };       
        var imageStyle = {
           width : "153px", 
           height : "153px",
           margin : "auto",
           display: "block",
           verticalAlign : "center"
       };           
                          
       return(
           <div style={marginTopStyle}>
               <img id="loadingImage" src="img\loading_spinner.gif" style={imageStyle}></img>
                <div id={this.props.componentId} className="new-instruments-container">                   
                    <div className="details-section hourly-section">
                        <div className="details-group total">
                            <span className="arrow"></span>
                            <span className="text-group">
                                <span className="tag">HOURLY</span>
                                <div className="data" style={grandTotalStyle}></div>
                            </span>
                        </div>
                        <div className="details-group eq">
                            <span className="arrow"></span>
                            <span className="text-group">
                                <div className="data" style={totalStyle}></div>
                                <span className="tag">EQ</span>
                            </span>
                        </div>
                        <div className="details-group fi">
                            <span className="arrow"></span>
                            <span className="text-group">
                                <div className="data" style={totalStyle}></div>
                                <span className="tag">FI</span>
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="details-section daily-section">
                        <div className="details-group total">
                            <span className="arrow"></span>
                            <span className="text-group">
                                <span className="tag">DAILY</span>
                                <div className="data" style={grandTotalStyle}></div>
                            </span>
                        </div>
                        <div className="details-group eq">
                            <span className="arrow"></span>
                            <span className="text-group">
                                <div className="data" style={totalStyle}></div>
                                <span className="tag">EQ</span>
                            </span>
                        </div>
                        <div className="details-group fi">
                            <span className="arrow"></span>
                            <span className="text-group">
                                <div className="data" style={totalStyle}></div>
                                <span className="tag">FI</span>
                            </span>
                        </div>
                    </div>
                    </div>
                    
                </div>
            </div>
       );
   } 
});
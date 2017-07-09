var activityServiceCall = {   
    isReady: false,
    subscribers:[],
    updateReady: function(){
        this.isReady = true;
        this.subscribers.forEach(function(action) {
            action();
        }, this);
        this.subscribers = [];
    },
    subscribeOnReady: function(action)
    {
        if (this.isReady)
            action();
       else
            this.subscribers.push(action);
    },
    start: function()
    {       
        var context = this;
        service.getRemote("CDDSRequestsConsumerBreakdown", "EQ", function() {
                service.getRemote("CDDSRequestsConsumerBreakdown", "FI", function() {
                    service.getRemote("NewInstruments", "", function() {
                        service.getRemote("Attributes", 100000, function() {
                            context.updateReady();                          
                        })
                    });
                });               
            });
    }
};
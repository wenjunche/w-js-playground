var finReady = {   
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
    }
};

fin.desktop.main(function() {
    finReady.updateReady();
});
Module.register('holomew', {
    requiresVersion: '2.1.0',

    defaults: {
        update_interval: 6000,
        stations: [],
        colnames: [
            'Leaving From', 
            'Final Destination', 
            'Departure Time'
        ]
    },

    getStyles: function() {},

    start: function() {
        this.sendSocketNotification('start')
    },

    stop: function() {
        this.sendSocketNotification('stop')
    },

    suspend: function() {
        this.stop()
    },

    resume: function() {
        this.start()
    },

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'new_trains':
                this.current_trains = [...payload]
                this.updateDom(500)
                break;
        
            default:
                break;
        }
    },

    notificationReceived: function(notification, payload, sender) {},

    getDom: function() {
        const table = document.createElement('table')
        const row = document.createElement('tr')
        this.config.colnames.forEach(header => {
            const th = document.createElement('th')
            th.setAttribute('scope', 'col')
            th.innerHTML = header
            row.appendChild(th)            
        })
        table.appendChild(row)

        if (this.current_trains !== undefined) {
            this.current_trains.forEach(train => {
                const row = document.createElement('row')
                const tds = ['from', 'to', 'depart'].forEach(attr => {
                    const td = document.createElement('td')
                    td.innerHTML = train[attr]
                    row.appendChild(td)
                })
                table.appendChild(row)
            })
        }
    },
})
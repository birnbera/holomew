Module.register('holomew', {
    requiresVersion: '2.1.0',

    defaults: {
        update_interval: 6000,
        bart_api: 'http://api.bart.gov/api/etd.aspx',
        bart_api_options: {
            cmd: 'etd',
            dir: 's',
            key: 'MW9S-E7SL-26DU-VV8V',
            json: 'y',
        },
        bart_stations: ['ROCK', 'MCAR'],
        colnames: [
            'Leaving From', 
            'Final Destination', 
            'Departure Time'
        ]
    },

    getStyles: function() {},

    start: function() {
        this.sendSocketNotification('start', this.config)
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
                this.current_trains = [...payload.new_trains]
                this.last_update = {...payload.last_update}
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
                const tds = ['from', 'to', 'depart', 'delay'].forEach(attr => {
                    const td = document.createElement('td')
                    td.innerHTML = train[attr]
                    row.appendChild(td)
                })
                table.appendChild(row)
            })
        }
        const div = document.createElement('div')
        div.appendChild(table)
        return div
    },
})
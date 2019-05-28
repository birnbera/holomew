Module.register('holomew', {
    requiresVersion: '2.1.0',

    defaults: {
        update_interval: 10000,
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
            'Departure Time',
            'Current Delay'
        ]
    },

    // getStyles: function() {},

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
                // console.log('received new trains')
                this.current_trains = [...payload.new_trains]
                this.last_update = {...payload.last_update}
                // Log.log('new update at: ' + this.last_update.time)
                // Log.log('new trains received: ' + JSON.stringify(this.current_trains))
                if (this.current_trains.length === 0) {
                    this.updateDom(1000)
                } else {
                    this.updateDom()
                }
                break;
        
            default:
                console.log(payload)
                break;
        }
    },

    notificationReceived: function(notification, payload, sender) {},

    getDom: function() {
        const div = document.createElement('div')
        div.className = 'small bold'

        const table = document.createElement('table')
        div.appendChild(table)

        const tr = document.createElement('tr')
        this.config.colnames.forEach(header => {
            const th = document.createElement('th')
            th.setAttribute('scope', 'col')
            th.innerHTML = header
            tr.appendChild(th)            
        })
        table.appendChild(tr)

        const caption = document.createElement('caption')
        caption.innerHTML = 'Last update: ' + this.last_update.time;
        caption.className = 'small thin dimmed'
        caption.setAttribute('style', 'caption-side: bottom')
        table.appendChild(caption)

        if (this.current_trains !== undefined) {
            this.current_trains.forEach(train => {
                const tr = document.createElement('tr')
                tr.className = 'small light'
                tr.setAttribute('style', 'color: ' + train.color)
                const tds = ['from', 'to', 'depart', 'delay'].forEach(attr => {
                    const td = document.createElement('td')
                    td.innerHTML = train[attr]
                    tr.appendChild(td)
                })
                table.appendChild(tr)
            })
            if (this.current_trains.length === 0) {
                const no_trains = document.createElement('td')
                no_trains.innerHTML = 'No current trains'
                no_trains.setAttribute('colspan', 4)
                no_trains.className = 'small dimmed'
                table.appendChild(no_trains)
            }

        }
        return div
    },
})
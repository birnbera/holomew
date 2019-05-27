import { stringify } from "querystring";

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
                console.log('received new trains')
                this.current_trains = [...payload.new_trains]
                this.last_update = {...payload.last_update}
                Log.log('new update at: ' + this.last_update.time)
                Log.log('new trains receive: ' + this.current_trains)
                this.updateDom(500)
                break;
        
            default:
                console.log(JSON.stringify(payload))
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

        if (this.current_trains !== undefined) {
            this.current_trains.forEach(train => {
                const tr = document.createElement('tr')
                const tds = ['from', 'to', 'depart', 'delay'].forEach(attr => {
                    const td = document.createElement('td')
                    td.innerHTML = train[attr]
                    tr.appendChild(td)
                })
                table.appendChild(tr)
            })
            if (this.current_trains.length === 0) {
                const p = document.createElement('p')
                p.innerHTML = 'No current trains'
                p.className = 'thin small dimmed'
                div.appendChild(p)
            }
        }
        return div
    },
})
const NodeHelper = require('node_helper')
const request = require('request')

module.exports = NodeHelper.create({
    start: function() {},

    stop: function() {},

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'start':
                if (this.timer !== undefined) {
                    clearInterval(this.timer)
                    this.timer = undefined
                }
                this.timer = setInterval(() => {
                    this.updateBartSchedule(payload)
                }, payload.update_interval);
                break;
            case 'stop':
                if (this.timer !== undefined) {
                    clearInterval(this.timer)
                    this.timer = undefined
                }
                break;
            
            default:
                break;
        }
    },

    parseTrainsFromBody: function(body) {
        if (body.root.message !== '') {
            return []
        } else {
            const {date, time, station} = {...body.root}
            this.last_update = {date: date, time: time}
            const {name, etd} = {...station}
            const results = []
            etd.forEach(etd_i => {
                const {destination, estimate} = {...etd_i}
                const estimates = estimate.forEach(estimate_i => {
                    const {minutes, delay, hexcolor} = {...estimate_i}
                    results.push({
                        from: name, 
                        to: destination, 
                        time: minutes,
                        delay: delay,
                        color: hexcolor
                    })
                })
            })

        }
    },

    updateBartSchedule: function(payload) {
        const results = []
        payload.bart_stations.forEach(stn => {
            request
                .get({
                    url: payload.bart_api,
                    qs: {...payload.bart_api_options, orig: stn},
                    json: true
                })
                .on('response', (res) => {
                    const station_trains = this.parseTrainsFromBody(res.body)
                    results.push(...station_trains)
                })
                .on('error', (err) => {
                    Log.log('error getting bart schedule')
                })
        })
        this.sendSocketNotification(
            'new_trains', 
            {last_update: this.last_update, new_trains: results}
        )
    }
})
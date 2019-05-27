const NodeHelper = require('node_helper')
const request = require('request')

module.exports = NodeHelper.create({
    // start: function() {},

    // stop: function() {},
    logBroswer: function(msg) {
        this.sendSocketNotification('log', 'node helper: ' + msg)
    },

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'start':
                console.log('received start')
                if (this.timer !== undefined) {
                    clearInterval(this.timer)
                    this.timer = undefined
                }
                this.timer = setInterval(() => {
                    this.updateBartSchedule(payload)
                }, payload.update_interval);
                break;
            case 'stop':
                console.log('received stop')
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
        try {
            console.log(body.root.message)
        } catch(e) {
            console.log(body)
        }
        if (body.root.message !== '') {
            return []
        } else {
            const {date, time, station} = {...body.root}
            this.last_update = {date: date, time: time}
            const {name, etd} = {...station}
            const results = []
            this.logBroswer(etd)
            etd.forEach(etd_i => {
                const {destination, estimate} = {...etd_i}
                this.logBroswer(estimate)
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
            return results
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
                }, (err, res, body) => {
                    if (err) {
                        this.logBroswer('error getting bart schedule')
                        console.log('error getting bart schedule')
                    } else {
                        this.logBroswer(body)
                        const station_trains = this.parseTrainsFromBody(body)
                        results.push(...station_trains)
                    }
                })
        })
        this.sendSocketNotification(
            'new_trains', 
            {last_update: this.last_update, new_trains: results}
        )
    }
})
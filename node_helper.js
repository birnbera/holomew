const NodeHelper = require('node_helper')
const request = require('request')

module.exports = NodeHelper.create({
    logBroswer: function(msg) {
        this.sendSocketNotification('log', JSON.stringify(msg))
    },

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'start':
                this.logBroswer('node_helper received start')
                if (this.timer !== undefined) {
                    clearInterval(this.timer)
                    this.timer = undefined
                }
                this.timer = setInterval(() => {
                    this.updateBartSchedule(payload)
                }, payload.update_interval);
                break;
            case 'stop':
                this.logBroswer('node_helper received stop')
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
        // this.logBroswer({parseTrainsFromBody: {body: body}})
        try {
            const {date, time, station} = {...body.root}
            this.last_update = {date: date, time: time}
            const {name, etd} = {...station[0]}
            const results = []
            // this.logBroswer(etd)
            etd.forEach(etd_i => {
                const {destination, estimate} = {...etd_i}
                // this.logBroswer(estimate)
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
            // this.logBroswer(results)
            return results
        } catch(e) {
            this.logBroswer(e)
            return []
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
                    } else {
                        const station_trains = this.parseTrainsFromBody(body)
                        this.logBroswer('results')
                        this.logBroswer(results)
                        results.push(...station_trains)
                        this.logBroswer(results)
                    }
                })
        })
        this.sendSocketNotification(
            'new_trains', 
            {last_update: this.last_update, new_trains: results}
        )
    }
})
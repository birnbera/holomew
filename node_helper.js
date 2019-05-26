const NodeHelper = require('node_helper')
const request = require('request')

module.exports = NodeHelper.create({
    start: function() {},

    stop: function() {},

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'start':
                setInterval(() => {
                    this.updateBartSchedule(payload)
                }, payload.update_interval);
                break;
            case 'stop':

                break;
            
            default:
                break;
        }
    },

    updateBartSchedule: function(payload) {
        const etds = payload.bart_stations.map(stn => {
            request
                .get({
                    url: payload.bart_api,
                    qs: {...payload.bart_api_options, orig: stn},
                    json: true
                })
                .on('response', function(res) {
                    const { body } = {...res}
                    if (body.root.message === '') {
                        const {date, time, station} = {...body.root}
                        return station.map(stn => {
                            stn.etd.map(etd => {
                                
                            })
                            const etd = {
                                from: stn.name,
                                to: 
                            }
                        })
                    }
                    
                })
                .on('error', function(err) {
                    Log.log('error getting bart schedule')
                })
        })

    }
})
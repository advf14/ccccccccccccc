
let svgCaptcha = require('svg-captcha');
let Create     = function(client, name){
        let captcha = svgCaptcha.create({background:'#999999', charPreset:'1234567890', noise:0});
        client.captcha = captcha.text;
        let data = {};
        data['data'] = 'data:image/svg+xml;base64,' + Buffer.from(captcha.data).toString('base64');
        data['name'] = name;
        client.red({captcha: data});
}
module.exports = function(data){
        switch(data){
                case 'signIn':
                        Create(this, 'signIn');
                        break;

                case 'signUp':
                        Create(this, 'signUp');
                        break;

                case 'giftcode':
                        Create(this, 'giftcode');
                        break;

                case 'forgotpass':
                        Create(this, 'forgotpass');
                        break;

                case 'transfer':
                        Create(this, 'transfer');
                        break;

                case 'chargeCard':
                        Create(this, 'chargeCard');
                        break;

                case 'withdrawXu':
                        Create(this, 'withdrawXu');
                        break;

                case 'withdrawCard':
                        Create(this, 'withdrawCard');
                        break;
                case 'momoController':
                        Create(this, 'momoController');
                        break;
                case 'bankingController':
                        Create(this, 'bankingController');
                        break;
        }
}

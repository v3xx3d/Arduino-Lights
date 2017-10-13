var animation;

var animations = {

    active: null,

    run: function (name, settings){
        if( this.sequences[name] !== undefined ){
            if( this.active ) clearInterval(this.active);
            this.sequences[name](settings);
        } else {
            console.log('Animation "' + name + '" not found!');
        }
    },

    sequences: {

        icicle: function (length){
            var lead = 0;
            var length = length || 20;

            animations.active = setInterval(function(){
                strip.pixel(lead).color('rgb(0,255,0)');
                for( var i = 1; i <= length; i++ ){
                    var c = 255 - Math.floor((255/(length-1)) * i);                    strip.pixel(adjustLed(lead-i)).color('rgb(0,' + c + ',0)');
                }
                strip.pixel(adjustLed(lead-(length+1))).color('rgb(0,0,0)');
                strip.show();
                lead++;
                if( lead === strip.length-1 ){
                    lead = 0;
                }
            }, 1000/fps);
        },

        rainDropFade: function(color){
            var c = { r: 0, g: 0, b: 255 };
            var tracker = [];
            var inc = 20;

            for( var i = 0; i < strip.length; i++ ){
                var rand_s = Math.floor(Math.random() * inc) + 1;
                var rand_a = Math.round(Math.random()) === 0 ? true : false;

                tracker.push({ r: c.r, g: c.g, b: c.b, asc: true, step: rand_s });
            }

            animations.active = setInterval( function(){
                for( var j = 0; j < strip.length; j++ ){
                    var step = tracker[j].step;

                    var rv = tracker[j].r = c.r - Math.floor((c.r/(inc)) * step);
                    var gv = tracker[j].g = c.g - Math.floor((c.g/(inc)) * step);
                    var bv = tracker[j].b = c.b - Math.floor((c.b/(inc)) * step);

                    if( j == 1 ){
                        // console.log(rv + ',' + gv + ',' + bv);
                    }

                    strip.pixel(j).color([rv,gv,bv]);

                    if( step === inc ){
                        tracker[j].asc = false;
                        tracker[j].step--;
                    } else if ( step === 0 ){
                        tracker[j].asc = true;
                        tracker[j].step++;
                    } else if( tracker[j].asc == true ){
                        tracker[j].step++;
                    } else {
                        tracker[j].step--;
                    }
                }
                strip.show();
            }, 1000/fps);

            console.log(strip.pixel(3).color());

        }
    }

}

function adjustLed(n){
    var count = strip.length;

    if( n < 0 ){
        n = count + n;
    }

    return n;
}

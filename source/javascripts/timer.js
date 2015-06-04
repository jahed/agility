var pages = pages || {};

pages.timer = pages.timer || (function() {
	var counter, counterText;
    var time = 0;
    var intervalId;
    var notification;
    var periodInput;
    var playButton;
    var pauseButton;
    var stopButton;

    var State = {
        STOPPED: "stopped",
        PLAYING: "playing",
        PAUSED : "paused"
    };

    var Color = {
        START: "#71B284",
        END: "#B22727"
    };

    var state = State.STOPPED;

    function init() {
        counter = $('.counter');
        counterText = counter.find('.counter-text');
        periodInput = $('input.period');
        stopButton = $('.nav-timer-stop');
        playButton = $('.nav-timer-play');
        pauseButton = $('.nav-timer-pause');


        counter.bind('click', function onClick() {
            if(state === State.STOPPED) {
                startCounter();
            } else if(state === State.PAUSED) {
                resumeCounter();
            } else if(state === State.PLAYING) {
                pauseCounter();
            }
        });

        parsePeriodInput();
        periodInput.bind('change', parsePeriodInput);

        stopButton.bind('click', stopCounter);
        playButton.bind('click', resumeCounter);
        pauseButton.bind('click', pauseCounter);

        if(!!window.Notification) {
            Notification.requestPermission();
        }

	}

    function parsePeriodInput() {
        var timeParts = periodInput[0].value.split(':');
        time = parseInt(timeParts[0],10)*60 + parseInt(timeParts[1],10);
    }

    function counterColor() {
        return getComputedStyle(counter[0])['background-color'];
    }

    function rotateCounter() {
        stopCountdown();
        counterText.text('Rotate');
        showNotification();
    }

    function stopCounter() {
        stopCountdown();
        counterText.text('Start');
        counter.removeAttr('style');
        parsePeriodInput();
    }

    function showNotification() {
        if (Notification.permission === "granted") {
            notification = new Notification("It's time to rotate!", {
                body: 'Step away from the keyboard.',
                icon: './images/alert.png'
            });

            notification.onclick = function() {
                window.focus();
                notification.close();
            };
        }

        $('audio.alert')[0].play();
    }

    function startCounter() {
        setState(State.PLAYING);

        counterText.text(counterFormat(time));
        counter.css({
            'background-color': Color.START,
            'transition': 'none'
        });

        startCountdown();
    }

    function pauseCounter() {
        setState(State.PAUSED);
        counter.css({
            'background-color': counterColor()
        });
        stopCountdown();
    }

    function resumeCounter() {
        setState(State.PLAYING);
        counter.css({
            'background-color': Color.END,
            'transition': 'background-color ' + time + 's'
        });
        startCountdown();
    }

    function setState(newState) {
        counter.removeClass(state);
        state = newState;
        counter.addClass(newState);

        if(!!notification) {
            notification.close();
        }
    }

    function countdown() {
        if(time === parseInt(periodInput[0].value, 10)) {
            counter.css({
                'background-color': Color.END,
                'transition': 'background-color ' + time + 's'
            });
        }

        time--;
        counterText.text(counterFormat(time));

        if(time === 0) {
            rotateCounter();
        }
    }

    function startCountdown() {
        intervalId = setInterval(countdown, 1000);
    }

    function stopCountdown() {
        setState(State.STOPPED);
        clearInterval(intervalId);
        intervalId = null;
    }

    function counterFormat(time) {
        var mins = Math.floor(time/60);
        var secs = time%60;

        return padNumber(mins) + ':' + padNumber(secs);
    }

    function padNumber(n) {
        return (n < 10 ? '0' : '') + n;
    }

	return {
		init: init
	};
})();

pages.timer.init();
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
    var settingsButton;
    var timerNav;

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
        timerNav = $('.nav-timer');
        stopButton = $('.nav-timer-stop');
        playButton = $('.nav-timer-play');
        pauseButton = $('.nav-timer-pause');
        settingsButton = $('.nav-timer-settings');

        counter.bind('click', function onClick() {
            if(state === State.STOPPED) {
                startCounter();
            } else if(state === State.PAUSED) {
                resumeCounter();
            } else if(state === State.PLAYING) {
                pauseCounter();
            }
        });

        stopButton.bind('click', stopCounter);
        playButton.bind('click', function() {
            if(state === State.STOPPED) {
                startCounter();
            } else {
                resumeCounter();
            }
        });
        pauseButton.bind('click', pauseCounter);
        settingsButton.bind('click', pauseCounter);

        if(!!window.Notification) {
            Notification.requestPermission();
        }

        stopCounter();
    }

    function parsePeriodInput() {
        var timeParts = periodInput[0].value.split(':');
        return parseInt(timeParts[0],10)*60 + parseInt(timeParts[1],10);
    }

    function resetTime() {
        time = parsePeriodInput();
    }

    function counterColor() {
        return getComputedStyle(counter[0])['background-color'];
    }

    function showNotification() {
        if (Notification.permission === "granted") {
            notification = new Notification("It's time to rotate!", {
                body: 'Click here and step away from the keyboard.',
                icon: './images/rotate.png',
                vibrate: [200, 100, 200]
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

        resetTime();
        counterText.text(counterFormat(time));
        counter.css({
            'background-color': Color.START,
            'transition': 'none'
        });

        startCountdown();
    }

    function pauseCounter() {
        if(state !== State.PLAYING) {
            return;
        }

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

    function rotateCounter() {
        setState(State.STOPPED);
        stopCountdown();
        counterText.text('Rotate');
        showNotification();
    }

    function stopCounter() {
        setState(State.STOPPED);
        stopCountdown();
        counterText.text('Start');
        counter.removeAttr('style');
    }

    function setState(newState) {
        counter.removeClass(state);
        state = newState;
        counter.addClass(newState);

        var $button;

        switch(newState) {
            case State.PLAYING:
                $button = playButton;
                break;
            case State.PAUSED:
                $button = pauseButton;
                break;
            case State.STOPPED:
                $button = stopButton;
        }

        setActiveButton($button);

        if(!!notification) {
            notification.close();
        }
    }

    function setActiveButton($button) {
        timerNav.children().each(function() {
            $(this).removeClass('active');
        });

        $button.addClass('active');
    }

    function countdown() {
        if(time === parsePeriodInput()) {
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
        if(intervalId) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(countdown, 1000);
    }

    function stopCountdown() {
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
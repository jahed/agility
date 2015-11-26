var pages = pages || {};

pages.timer = pages.timer || (function() {
	  var counter;
    var pageTitle;
    var counterText;
    var turnText;
    var time = 0;
    var intervalId;
    var notification;
    var periodInput;
    var playButton;
    var pauseButton;
    var stopButton;
    var settingsButton;
    var timerNav;

    var addMobsterButton;
    var mobsterTemplate;
    var mobsterContainer;
    var mobsters;
    var currentMobsterIndex;

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
        $.get('./javascripts/templates/mobster.mustache')
            .success(function(template) {
                mobsterTemplate = template
            })
            .then(initCounter);
    }

    function initCounter() {
        counter = $('.counter');
        counterText = counter.find('.counter-text');
        periodInput = $('input.period');
        timerNav = $('.nav-timer');
        stopButton = $('.nav-timer-stop');
        playButton = $('.nav-timer-play');
        pauseButton = $('.nav-timer-pause');
        settingsButton = $('.nav-timer-settings');
        addMobsterButton = $('.add-mobster');
        mobsterContainer = $('.mobster-container');
        pageTitle = $('title');

        turnText = $('.turn-text');

        mobsters = [];
        currentMobsterIndex = 0;

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

        addMobsterButton.bind('click', addMobster);

        if(!!window.Notification) {
            Notification.requestPermission();
        }
        stopCounter();
    }

    function addMobster() {
        var id = mobsters.length;

        var $mobster = $(Mustache.render(mobsterTemplate, {
            id: id
        }));

        var mobster = {
            root: $mobster,
            name: $mobster.find('.mobster-control-name')[0],
            disabled: false
        };

        $mobster.find('.mobster-control-turn').bind('click', function() {
            if(mobster.disabled) return;
            currentMobsterIndex = mobster.root.index();
            updateTurn();
        });

        $mobster.find('.mobster-control-up').bind('click', function() {
            var index = mobster.root.index();
            if(index === 0) return;

            var aboveMobster = mobsters[index-1];
            mobster.root.after(aboveMobster.root);
            mobsters[index] = mobsters[index-1];
            mobsters[index-1] = mobster;
        });

        $mobster.find('.mobster-control-down').bind('click', function() {
            var index = mobster.root.index();
            if(index === mobsters.length) return;

            var belowMobster = mobsters[index+1];
            mobster.root.before(belowMobster.root);
            mobsters[index] = mobsters[index+1];
            mobsters[index+1] = mobster;
        });

        $mobster.find('.mobster-control-disable').bind('click', function() {
            if(mobster.disabled || mobster === mobsters[currentMobsterIndex]) {
                mobster.disabled = false;
                mobster.root.removeClass('disabled');
            } else {
                mobster.disabled = true;
                mobster.root.addClass('disabled');
            }
        });

        mobsters.push(mobster);
        mobsterContainer.append(mobster.root);
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
            var body =  'Click here and step away from the keyboard.';

            if(mobbingEnabled()) {
                body += '\n' + mobsters[currentMobsterIndex].name.value + ' is next';
            }

            notification = new Notification("It's time to rotate!", {
                body: body,
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

    function updateCounterText(text) {
        counterText.text(text);
        updatePageTitle();
    }

    function updatePageTitle() {
        var titleParts = ['[' + counterText.text() + ']'];
        if(mobbingEnabled()) {
            titleParts.push(getCurrentMobsterName() + "'s Turn")
        }
        titleParts.push('- Agility Timer');

        pageTitle.text(titleParts.join(' '));
    }

    function startCounter() {
        setState(State.PLAYING);

        resetTime();
        updateCounterText(counterFormat(time));
        counter.css({
            'background-color': Color.START,
            'transition': 'none'
        });

        updateTurn();
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

        updateCounterText('Rotate');
        nextMobster();
        showNotification();
	}

    function mobbingEnabled() {
        return mobsters.filter(function(mobster) {
            return !mobster.disabled;
        }).length >= 2;
    }

    function updateTurn() {
        mobsters.forEach(function(mobster) {
            mobster.root.removeClass('active');
        });

        if(mobbingEnabled()) {
            var mobster = mobsters[currentMobsterIndex];
            turnText.text(mobster.name.value + "'s Turn");
            mobster.root.addClass('active');
        } else {
            turnText.empty();
        }

        updatePageTitle();
    }

    function nextMobster() {
        if (mobbingEnabled()) {
            do {
                currentMobsterIndex++;
                if (currentMobsterIndex >= mobsters.length) {
                    currentMobsterIndex = 0;
                }
            } while(mobsters[currentMobsterIndex].disabled);

            turnText.text(getCurrentMobsterName() + " is next");
        } else {
            turnText.empty();
        }

        updatePageTitle();
    }

    function getCurrentMobsterName() {
        return mobsters[currentMobsterIndex].name.value;
    }

    function stopCounter() {
        setState(State.STOPPED);
        stopCountdown();
        updateCounterText('Start');
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
        updateCounterText(counterFormat(time));

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
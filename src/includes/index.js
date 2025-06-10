const scroll_today_into_view = () => {
    if (window.location.href.indexOf("#install") > -1) {
        document.getElementById("about").scrollIntoView({ behavior: 'smooth' });
        return;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const element = document.getElementById(today);

    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        console.log(`Scrolled ${element.id} into view`);

        element.classList.add("today");
    }
};

function showCongratulationsAlert() {
  // Check if localStorage is available
  if (typeof localStorage !== 'undefined') {
    // Get current count from localStorage (default to 0 if not set)
    const alertCount = parseInt(localStorage.getItem('congratsAlertCount') || '0');
    
    // Only show alert if it has been shown fewer than 3 times
    if (alertCount < 3) {
      alert("Congratulations 🎊 Bhagwan Pruthvi for 3 papers (2 in ISVLSI and 1 in ISLPED) getting accepted, always an inspiration and pride to our lab");
      
      // Increment the count and store it back in localStorage
      localStorage.setItem('congratsAlertCount', (alertCount + 1).toString());
    }
  }
}

const align_section = (selector) => {
    const sectionDivs = document.querySelectorAll(selector);

    let maxHeight = 0;
    sectionDivs.forEach(div => {
        let height = div.offsetHeight;
        if (height > maxHeight) {
            maxHeight = height;
        }
    });

    sectionDivs.forEach(div => {
        div.style.height = maxHeight + 'px';
    });

    console.log("Aligned section ", selector);
};


const setup_page = () => {
    align_section('div.Breakfast');
    align_section('div.Lunch');
    align_section('div.Snacks');
    align_section('div.Dinner');

    scroll_today_into_view();

    const buttonRebuild = document.getElementById('rebuildButton');

    if(buttonRebuild) {

        // Hide rebuild button on the about page
        if (window.location.href.indexOf("#install") > -1) {
            buttonRebuild.style.display = "none";
        }

        buttonRebuild.addEventListener('click', async () => {
            // Just a URL that makes the menu get rebuilt, not API key, don't get too excited
            const url_rebuild = 'https://api.netlify.com/build_hooks/648ffcecb9520931d2053256';
    
            buttonRebuild.style.visibility = 'hidden';
    
            await fetch(url_rebuild, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: '{}'
            })
    
            console.log("Rebuild Button: Initiated site rebuid.");
            alert("Started rebuild. Check again in a minute.");
        })
    } else {
        console.log("Unexpected: Rebuild button disappeared");
    }

    console.log("Added click handler for rebuild button");
    console.log("Page initialisation complete");

    // showCongratulationsAlert();
};



if (document.readyState !== 'loading') {
    // Document has already finished loading.
    // DOMContentLoaded won't fire now.
    console.log("Document has already finished loading");
    
    scroll_today_into_view();
    setup_page();
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("event: DOMContentLoaded");

    scroll_today_into_view();
    setup_page();
});


document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log("event: visibility change: visible");

        scroll_today_into_view();
        setup_page();
    } else {
        console.log("event: visibilitychange: INvisible");
    }
});

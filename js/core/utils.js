// Teyvat Companion | core / utils
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
// Bind controls / initialize this section in original startup order.
const initializeUtilsSection1 = () => {
    if (true) {
        document.documentElement.classList.add('android-app');
        const movePriority = () => {
            const overview = document.getElementById('page-overview'), priority = overview?.querySelector('.planner-minitask'), hero = overview?.querySelector('.hero');
            if (priority && hero)
                overview.insertBefore(priority, hero);
        };
        if (document.readyState === 'loading')
            document.addEventListener('DOMContentLoaded', movePriority, { once: true });
        else
            movePriority();
    }
};

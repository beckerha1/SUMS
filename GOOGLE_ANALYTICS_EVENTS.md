# Google Analytics Event Tracking - SUMS Game

## Implemented Events

All events are tracked using Google Analytics 4 (GA4) and will appear in your Analytics dashboard under Events.

### 1. **game_start** 
Fired when user clicks to play a game

**When:** User clicks "Play Mini SUMS" or "Play SUMS" button

**Parameters:**
- `game_mode`: Either `"mini"` or `"full"`

**Example:**
```javascript
gtag('event', 'game_start', {
  game_mode: 'mini'
});
```

**Use Cases:**
- Track which game mode is more popular
- See how many games are started per day
- Calculate game completion rate (completions ÷ starts)

---

### 2. **game_complete**
Fired when user successfully completes a puzzle

**When:** All cells are filled and win screen appears

**Parameters:**
- `game_mode`: Either `"mini"` or `"full"`
- `completion_time_seconds`: Time in seconds to complete (integer)
- `total_moves`: Number of numbers placed (integer)

**Example:**
```javascript
gtag('event', 'game_complete', {
  game_mode: 'full',
  completion_time_seconds: 180,
  total_moves: 45
});
```

**Use Cases:**
- Track completion rates
- Calculate average completion time
- See average moves per game
- Compare Mini vs Full difficulty

---

### 3. **game_abandon**
Fired when user leaves game mid-play

**When:** 
- User clicks "Return to home" during gameplay
- User closes tab/browser while playing
- User navigates away from page

**Parameters:**
- `game_mode`: Either `"mini"` or `"full"`
- `time_played_seconds`: Time spent before abandoning (integer)
- `total_moves`: Number of moves made before abandoning (integer)

**Example:**
```javascript
gtag('event', 'game_abandon', {
  game_mode: 'mini',
  time_played_seconds: 60,
  total_moves: 15
});
```

**Use Cases:**
- Identify where players get stuck
- Calculate abandonment rate
- See average time before giving up

---

## Viewing Events in Google Analytics

### Realtime Events (Immediate)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Click **Reports** → **Realtime**
4. Scroll to **Event count by Event name**
5. You should see: `game_start`, `game_complete`, `game_abandon`

### Historical Data (24-48 hours delay)
1. **Reports** → **Engagement** → **Events**
2. Click on event name to see details
3. Click **View event parameter** to see custom parameters

### Custom Reports

**Completion Rate:**
- Metric 1: `game_start` count
- Metric 2: `game_complete` count
- Formula: (game_complete ÷ game_start) × 100

**Average Completion Time:**
- Event: `game_complete`
- Parameter: `completion_time_seconds`
- Metric: Average

**Mini vs Full Popularity:**
- Event: `game_start`
- Dimension: `game_mode`
- Chart type: Pie chart

---

## Sample Analytics Queries

### See all game starts by mode
```
Event name: game_start
Dimension: game_mode (event parameter)
```

### Average completion time for Mini games
```
Event name: game_complete
Filter: game_mode = mini
Metric: avg(completion_time_seconds)
```

### Abandonment rate
```
Total abandonments: Count of game_abandon
Total starts: Count of game_start
Rate: (game_abandon ÷ game_start) × 100
```

---

## Testing Your Events

### Method 1: DebugView (Recommended)
1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable the debugger
3. Visit sums.games
4. Play a game
5. Go to GA → **Admin** → **DebugView**
6. See events in real-time with all parameters

### Method 2: Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Type: `window.gtag`
4. Should show the gtag function
5. Play the game and watch for gtag calls

### Method 3: Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "collect"
4. Start a game
5. Should see POST requests to `google-analytics.com/g/collect`
6. Click on request → Payload to see event data

---

## Expected Data Examples

### After 1 Week
- **game_start events**: ~500 (depends on traffic)
- **game_complete events**: ~300 (60% completion rate)
- **game_abandon events**: ~200 (40% abandonment)
- **Average completion time**: 
  - Mini: 1-2 minutes
  - Full: 3-5 minutes

### Useful Insights
1. **Peak play times** - When are most games started?
2. **Device breakdown** - Mobile vs Desktop completion rates
3. **Geography** - Where are players located?
4. **Retention** - Do players return next day?

---

## Troubleshooting

### "Not seeing events in Analytics"
- ✅ Check GA Measurement ID is correct in index.html
- ✅ Wait 24-48 hours for historical reports
- ✅ Use Realtime or DebugView for instant verification
- ✅ Check if ad blockers are blocking gtag
- ✅ Verify site is deployed to production (not localhost)

### "Events showing but no parameters"
- Check browser console for errors
- Verify parameter names match exactly
- Use DebugView to see parameter values
- Remember: parameters may take 24h to appear in standard reports

### "Duplicate game_abandon events"
- Expected! Both "return home" and "beforeunload" can fire
- This is intentional to catch all abandonment scenarios
- GA will deduplicate similar events within the same session

---

## Privacy Considerations

All tracking is anonymous and complies with:
- ✅ No personally identifiable information (PII)
- ✅ No tracking of names, emails, or IPs (GA anonymizes)
- ✅ Mentioned in Privacy Policy
- ✅ Standard analytics data only

Users can opt-out via:
- Browser "Do Not Track" settings
- Ad blockers
- Google Analytics Opt-out Browser Add-on

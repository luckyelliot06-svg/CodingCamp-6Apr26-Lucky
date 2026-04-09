# Requirements Document

## Introduction

A personal dashboard web app built with HTML, CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend, using Local Storage for persistence. The dashboard provides a greeting with time/date, a focus timer, a to-do list, and quick links to favorite websites. It also supports light/dark mode, a custom user name in the greeting, and duplicate task prevention.

## Glossary

- **Dashboard**: The single-page web application that hosts all widgets.
- **Greeting_Widget**: The section of the Dashboard that displays the current time, date, and a personalized greeting message.
- **Focus_Timer**: The countdown timer widget used for focused work sessions.
- **Todo_List**: The widget that manages the user's task list.
- **Quick_Links**: The widget that displays and manages shortcut buttons to external URLs.
- **Local_Storage**: The browser's built-in client-side key-value storage API.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.
- **User_Name**: The display name entered by the user for use in the greeting.
- **Task**: A single to-do item with a text description and a completion state.
- **Session_Duration**: The configurable length of a Focus_Timer countdown, defaulting to 25 minutes.

---

## Requirements

### Requirement 1: Display Greeting with Time and Date

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an at-a-glance overview of the moment.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date including the day of the week, month, and day number.
3. WHEN the current time is between 05:00 and 11:59, THE Greeting_Widget SHALL display "Good morning".
4. WHEN the current time is between 12:00 and 17:59, THE Greeting_Widget SHALL display "Good afternoon".
5. WHEN the current time is between 18:00 and 04:59, THE Greeting_Widget SHALL display "Good evening".

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting feels personalized to me.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL provide an input field for the user to enter a User_Name.
2. WHEN the user submits a non-empty User_Name, THE Greeting_Widget SHALL display the greeting as "[greeting], [User_Name]".
3. WHEN the user submits a non-empty User_Name, THE Dashboard SHALL persist the User_Name to Local_Storage.
4. WHEN the Dashboard loads and a User_Name exists in Local_Storage, THE Greeting_Widget SHALL display the stored User_Name without requiring re-entry.
5. IF the user submits an empty User_Name, THEN THE Greeting_Widget SHALL display the greeting without a name suffix.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a countdown timer for focused work sessions, so that I can manage my time using the Pomodoro technique.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display a countdown in MM:SS format.
2. WHEN the Dashboard loads and no Session_Duration has been saved, THE Focus_Timer SHALL default to a 25-minute Session_Duration.
3. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down from the current displayed time.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown at the current remaining time.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL restore the countdown to the current Session_Duration.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and notify the user that the session is complete.

---

### Requirement 4: To-Do List — Core Task Management

**User Story:** As a user, I want to add, edit, complete, and delete tasks, so that I can track what I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and a submit control for adding new Tasks.
2. WHEN the user submits a new Task, THE Todo_List SHALL append the Task to the list and persist all Tasks to Local_Storage.
3. WHEN the Dashboard loads, THE Todo_List SHALL restore all Tasks from Local_Storage.
4. WHEN the user activates the edit control on a Task, THE Todo_List SHALL allow the user to modify the Task's text and save the updated text to Local_Storage.
5. WHEN the user activates the complete control on a Task, THE Todo_List SHALL toggle the Task's completion state and persist the updated state to Local_Storage.
6. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the list and update Local_Storage.
7. IF the user attempts to submit a Task with empty text, THEN THE Todo_List SHALL reject the submission and display an inline validation message.

---

### Requirement 5: Prevent Duplicate Tasks

**User Story:** As a user, I want the dashboard to block duplicate task entries, so that my to-do list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the user submits a new Task whose text matches an existing Task (case-insensitive), THE Todo_List SHALL reject the submission.
2. WHEN a duplicate Task submission is rejected, THE Todo_List SHALL display an inline message indicating the Task already exists.
3. WHEN the user edits a Task and saves text that matches another existing Task (case-insensitive), THE Todo_List SHALL reject the update and display an inline duplicate message.

---

### Requirement 6: Quick Links

**User Story:** As a user, I want to save and access my favorite website shortcuts from the dashboard, so that I can navigate quickly without typing URLs.

#### Acceptance Criteria

1. THE Quick_Links widget SHALL provide input fields for a link label and a URL, and a submit control to add a new link.
2. WHEN the user submits a new link with a non-empty label and a valid URL, THE Quick_Links widget SHALL add a button for that link and persist all links to Local_Storage.
3. WHEN the user activates a link button, THE Dashboard SHALL open the corresponding URL in a new browser tab.
4. WHEN the Dashboard loads, THE Quick_Links widget SHALL restore all saved links from Local_Storage.
5. WHEN the user activates the delete control on a link, THE Quick_Links widget SHALL remove the link and update Local_Storage.
6. IF the user submits a link with an empty label or an invalid URL, THEN THE Quick_Links widget SHALL reject the submission and display an inline validation message.

---

### Requirement 7: Light / Dark Mode

**User Story:** As a user, I want to switch between light and dark themes, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control to switch between the light Theme and the dark Theme.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL apply the selected Theme to all visible elements immediately without a page reload.
3. WHEN the user selects a Theme, THE Dashboard SHALL persist the Theme preference to Local_Storage.
4. WHEN the Dashboard loads and a Theme preference exists in Local_Storage, THE Dashboard SHALL apply the stored Theme before rendering content.
5. WHEN the Dashboard loads and no Theme preference exists in Local_Storage, THE Dashboard SHALL apply the light Theme by default.

---

### Requirement 8: Data Persistence Integrity

**User Story:** As a user, I want my data to survive page reloads, so that I don't lose my tasks, links, name, or preferences.

#### Acceptance Criteria

1. THE Dashboard SHALL read all persisted data from Local_Storage on every page load before rendering any widget.
2. WHEN any user-initiated change occurs, THE Dashboard SHALL write the updated data to Local_Storage before the operation is considered complete.
3. IF Local_Storage is unavailable or a read operation fails, THEN THE Dashboard SHALL render the affected widget with its default empty state and display a non-blocking warning message.

---

### Requirement 9: Browser Compatibility and Performance

**User Story:** As a user, I want the dashboard to load fast and work across modern browsers, so that I can rely on it daily regardless of which browser I use.

#### Acceptance Criteria

1. THE Dashboard SHALL load and render all widgets within 2 seconds on a standard broadband connection.
2. THE Dashboard SHALL function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL use only standard HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
4. WHEN the user interacts with any widget control, THE Dashboard SHALL reflect the change in the UI within 100ms.

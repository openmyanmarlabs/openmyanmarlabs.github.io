# Idea

I want you to update some ux and to fix in `@apps/open-myanmar-invoice` electrobun app.

## Minor Fixes

- In Draft Invoice, User also need to update new data and need to save that states. In current version you only can change paid/unpaid invoice. So add update draft data button.

- "You can only edit in Draft." will show when I click edit icon from unpaid/paid state invoice detail. So I don't want to user confuse. Hide View/Edit icon when invoice is paid or unpaid.

- When we change invoice state from 'Draft' to 'Paid' or 'Unpaid', we should validate. It's like a submit button for us. Prevent if there is no items and no customer and also must add due date. Able to click but show toast message or something.

- To make distinct ui for 'Add % tax' and 'Add fee' Buttons

- Add a little width to 'Rate' column width in invoice detail , eg set min width at least to fit '5000000' font widht length.

## Major Added

We will change dashboard for quick fetching data. We don't all calculation and all data like there is Animation Group Button like this month, 3month, 6month . and default will go with 'this month' and just fetching for this month data for dashboard . if needed ui use frontend-design skill for re-arrage layout.
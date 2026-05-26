# Idea

I want you to update some ux and to fix in `@apps/open-myanmar-invoice` electrobun app.

## Minor Changes

- when i choose `MMK` in currency setting . Why everwhere show only word `K` it must show `MMK` not only one word `K`

- Dont need to change localized currenty digit just show English Currency. When I choose `MMK` in currency setting, just show `0-9` not `၀-၉` in digit.

- We'll remove Theme (Light, Dark, System) Toggler, Only Light will work on this app. because there is some error occur while pdf and exporting invoice (Dark Color Issue).


## UI Changes

We will make Side bar for other routes. In the App bar only have title and logo like nav bar ( Logo + 'Open Myanmar Invoice').

Add Side bar for routes with logo.

- use `remix-icon` for logos
- in middle (center) content should consistency width min width for large screen. now this size is a little bit small so make a bit scaler version.


## Overflow issue

All these `invoice-list` , `client-list`, `product-list` screen have same issue for the setting icon in table row. When user click setting icon , the popup can't be shown properly because of table overflow.



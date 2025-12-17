# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "SteppersLife" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "SteppersLife" [ref=e7]
      - navigation [ref=e8]:
        - link "Events" [ref=e9] [cursor=pointer]:
          - /url: /events
        - link "Classes" [ref=e10] [cursor=pointer]:
          - /url: /classes
        - link "Marketplace" [ref=e11] [cursor=pointer]:
          - /url: /marketplace
        - link "Restaurants" [ref=e12] [cursor=pointer]:
          - /url: /restaurants
      - generic [ref=e13]:
        - button "Dark mode" [ref=e14]:
          - img [ref=e15]
        - link "Sign In" [ref=e17] [cursor=pointer]:
          - /url: /login
          - img [ref=e18]
          - text: Sign In
  - generic [ref=e22]:
    - img [ref=e23]
    - heading "Please sign in" [level=2] [ref=e25]
    - paragraph [ref=e26]: You need to be logged in to view your tickets
    - link "Sign In" [ref=e27] [cursor=pointer]:
      - /url: /login
  - alert [ref=e28]
```
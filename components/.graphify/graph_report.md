# Graph Report

**Nodes:** 90 | **Edges:** 145 | **Communities:** 17

## Hub Nodes (God Nodes)

- **PlaceAutocomplete()** (degree: 22, community: 70)
- **react** (degree: 18, community: 60)
- **exportToCSV()** (degree: 14, community: 67)
- **exportToCSV()** (degree: 14, community: 67)
- **InfrastructureForm.tsx** (degree: 10, community: 60)
- **__hooks_useinfrastructure** (degree: 8, community: 60)
- **__lib_api_officerapi** (degree: 6, community: 60)
- **MainHeader.tsx** (degree: 6, community: 43)
- **uploadToCloudinary()** (degree: 6, community: 46)
- **map** (degree: 6, community: 67)

## Surprising Connections

- **GalleryClient.tsx** -> **react** (imports) [community 37 -> 60]
- **GalleryClient.tsx** -> **next_image** (imports) [community 37 -> 57]
- **RegistrationForm.tsx** -> **react** (imports) [community 47 -> 60]
- **RegistrationForm.tsx** -> **__lib_api_infrastructure** (imports) [community 47 -> 34]
- **AdminInfrastructurePage.tsx** -> **__hooks_useadminmodules** (imports) [community 60 -> 23]
- **AdminMangalDalPage.tsx** -> **react** (imports) [community 23 -> 60]
- **AdminMangalDalPage.tsx** -> **__hooks_useinfrastructure** (imports) [community 23 -> 60]
- **AdminMangalDalPage.tsx** -> **exportToCSV()** (contains) [community 23 -> 67]
- **MainHeader.tsx** -> **react** (imports) [community 43 -> 60]
- **MainHeader.tsx** -> **next_link** (imports) [community 43 -> 58]
- **MainHeader.tsx** -> **next_image** (imports) [community 43 -> 57]
- **MainHeader.tsx** -> **next_navigation** (imports) [community 43 -> 59]
- **MainHeader.tsx** -> **__contexts_languagecontext** (imports) [community 43 -> 38]
- **Footer.tsx** -> **react** (imports) [community 57 -> 60]
- **Footer.tsx** -> **next_link** (imports) [community 57 -> 58]
- **LocationPicker.tsx** -> **react** (imports) [community 42 -> 60]
- **LocationPicker.tsx** -> **MapHandler()** (contains) [community 42 -> 85]
- **MapHandler()** -> **useeffect** (calls) [community 85 -> 70]
- **PlaceAutocomplete.tsx** -> **_vis_gl_react_google_maps** (imports) [community 60 -> 42]
- **PlaceAutocomplete.tsx** -> **PlaceAutocomplete()** (contains) [community 60 -> 70]
- **InfrastructureForm.tsx** -> **_vis_gl_react_google_maps** (imports) [community 60 -> 42]
- **InfrastructureForm.tsx** -> **uploadToCloudinary()** (contains) [community 60 -> 46]
- **onlyDigits()** -> **replace** (calls) [community 60 -> 67]
- **MangalDalPage.tsx** -> **exportToCSV()** (contains) [community 60 -> 67]
- **FloatingElements.tsx** -> **FloatingElements()** (contains) [community 59 -> 80]
- **InfraDetailModal.tsx** -> **react** (imports) [community 42 -> 60]
- **PhotoSubmissionModal.tsx** -> **__lib_api_infrastructure** (imports) [community 60 -> 34]
- **PhotoSubmissionModal.tsx** -> **uploadToCloudinary()** (contains) [community 60 -> 46]
- **uploadToCloudinary()** -> **startswith** (calls) [community 46 -> 80]
- **Carousel.tsx** -> **next_image** (imports) [community 60 -> 57]

## Suggested Questions

- Why does PlaceAutocomplete() have so many connections?
- Why does react have so many connections?
- Why does exportToCSV() have so many connections?
- Why does exportToCSV() have so many connections?
- Why does InfrastructureForm.tsx have so many connections?
- What connects the 17 different communities?

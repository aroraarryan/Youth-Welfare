# Graph Report

**Nodes:** 40 | **Edges:** 51 | **Communities:** 10

## Hub Nodes (God Nodes)

- **apiFetch()** (degree: 15, community: 26)
- **___api** (degree: 9, community: 11)
- **fetch** (degree: 6, community: 19)
- **json** (degree: 6, community: 22)
- **uploadOfficerPhoto()** (degree: 5, community: 16)
- **refreshAccessToken()** (degree: 5, community: 24)
- **adminModulesApi.ts** (degree: 3, community: 1)
- **adminFetch()** (degree: 3, community: 19)
- **getInfraStats()** (degree: 3, community: 22)
- **officerApi.ts** (degree: 3, community: 11)

## Surprising Connections

- **react-query.tsx** -> **ReactQueryProvider()** (contains) [community 28 -> 39]
- **refreshAccessToken()** -> **fetch** (calls) [community 24 -> 19]
- **refreshAccessToken()** -> **json** (calls) [community 24 -> 22]
- **api.ts** -> **apiFetch()** (contains) [community 24 -> 26]
- **apiFetch()** -> **set** (calls) [community 26 -> 24]
- **apiFetch()** -> **fetch** (calls) [community 26 -> 19]
- **apiFetch()** -> **refreshAccessToken()** (calls) [community 26 -> 24]
- **apiFetch()** -> **json** (calls) [community 26 -> 22]
- **officerFetch()** -> **fetch** (calls) [community 11 -> 19]
- **officerFetch()** -> **json** (calls) [community 11 -> 22]
- **officerApi.ts** -> **uploadOfficerPhoto()** (contains) [community 11 -> 16]
- **uploadOfficerPhoto()** -> **fetch** (calls) [community 16 -> 19]
- **uploadOfficerPhoto()** -> **json** (calls) [community 16 -> 22]
- **adminModulesApi.ts** -> **___api** (imports) [community 1 -> 11]
- **adminModulesApi.ts** -> **adminFetch()** (contains) [community 1 -> 19]
- **adminFetch()** -> **json** (calls) [community 19 -> 22]
- **infrastructure.ts** -> **getInfraStats()** (contains) [community 11 -> 22]
- **getInfraStats()** -> **fetch** (calls) [community 22 -> 19]

## Suggested Questions

- Why does apiFetch() have so many connections?
- Why does ___api have so many connections?
- Why does fetch have so many connections?
- Why does json have so many connections?
- Why does uploadOfficerPhoto() have so many connections?
- What connects the 10 different communities?

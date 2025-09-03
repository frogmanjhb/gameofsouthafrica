/* eslint-disable */
// Game state management
let currentCharacter = '';
let currentScene = 0;
let gameHistory = [];

// Background images for different scenes
const backgrounds = {
    khoisan: {
        intro: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6Izg3Q0VGNDtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM1QkcyQjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ3Jhc3MiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NEE0NDM7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDU4QzQ1O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2t5KSIgLz48cmVjdCB5PSIxNDAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2dyYXNzKSIgLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNDAiIHI9IjE1IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEzNSIgcj0iMTgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTQ1IiByPSIxMiIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSIxMzgiIHI9IjE2IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE0MiIgcj0iMTQiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMTM2IiByPSIxNyIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIxNDAiIHI9IjEzIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjEzOCIgcj0iMTUiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNTAwIiBjeT0iMTQzIiByPSIxMSIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI1NTAiIGN5PSIxMzciIHI9IjE0IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjYwMCIgY3k9IjE0MSIgcj0iMTYiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNjUwIiBjeT0iMTM5IiByPSIxMyIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI3MDAiIGN5PSIxNDQiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9Ijc1MCIgY3k9IjEzNyIgcj0iMTUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNTAiIHk9IjE0NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjMwMCIgeT0iMTQwIiB3aWR0aD0iMjUiIGhlaWdodD0iMTUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNTUwIiB5PSIxNDMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxOCIgZmlsbD0iIzhCNDUxMyIgLz48dGV4dCB4PSI0MDAiIHk9IjMwIiBmb250LWZhbWlseT0iQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5LaG9pLVNhbiBIZXJkZXI8L3RleHQ+PC9zdmc+',
        conflict: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOTY0NztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRjc0M0M7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNkZBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTEwIiB3aWR0aD0iNTAiIGhlaWdodD0iMzUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjUwIiB5PSIxMjUiIHdpZHRoPSIzNSIgaGVpZ2h0PSIyNSIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMTQ1IiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjU1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzAwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkNvbmZsaWN0PC90ZXh0Pjwvc3ZnPg==',
        disease: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNUU1RTU7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNkZBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTEwIiB3aWR0aD0iNTAiIGhlaWdodD0iMzUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjUwIiB5PSIxMjUiIHdpZHRoPSIzNSIgaGVpZ2h0PSIyNSIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMTQ1IiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjU1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzAwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPlNtYWxscG94IEVwaWRlbWljPC90ZXh0Pjwvc3ZnPg==',
        labor: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzI3QUU4NTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxQTczNEY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjVBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iNTAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTUwIiB5PSI5MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjIwMCIgeT0iMTEwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMjUwIiB5PSI4MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjMwMCIgeT0iMTAwIiB3aWR0aD0iMzUiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMzUwIiB5PSI5MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjQwMCIgeT0iMTEwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNDUwIiB5PSI4NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjU1IiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTA1IiB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNTUwIiB5PSI5NSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjYwMCIgeT0iMTE1IiB3aWR0aD0iMzAiIGhlaWdodD0iMjUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjUwIiB5PSI4NSIgd2lkdGg9IjM1IiBoZWlnaHQ9IjU1IiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjcwMCIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUiIGN5PSIxNDAiIHI9IjgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMTI1IiBjeT0iMTM1IiByPSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNzUiIGN5PSIxNDAiIHI9IjciIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMjI1IiBjeT0iMTM4IiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI3NSIgY3k9IjE0MiIgcj0iNiIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIzMjUiIGN5PSIxMzciIHI9IjgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMzc1IiBjeT0iMTQwIiByPSI3IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjQyNSIgY3k9IjEzNSIgcj0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNDc1IiBjeT0iMTQyIiByPSI2IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjUyNSIgY3k9IjEzOCIgcj0iOCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI1NzUiIGN5PSIxNDAiIHI9IjciIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNjI1IiBjeT0iMTM3IiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjY3NSIgY3k9IjE0MiIgcj0iNiIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI3MjUiIGN5PSIxMzgiIHI9IjgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUwIiBjeT0iMTQwIiByPSI1IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkxhYm9yIFNob3J0YWdlPC90ZXh0Pjwvc3ZnPg==',
        migration: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOTY0NztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRjc0M0M7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNkZBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTEwIiB3aWR0aD0iNTAiIGhlaWdodD0iMzUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjUwIiB5PSIxMjUiIHdpZHRoPSIzNSIgaGVpZ2h0PSIyNSIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMTQ1IiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjU1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzAwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkZyb250aWVyIEV4cGFuc2lvbjwvdGV4dD48L3N2Zz4='
    },
    dutch: {
        intro: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM0OThEQkM7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjM0OTUwO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJzZWEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0QjQ5Q0M7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzQ0OTU1O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJncmFzcyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY1QTQ0MztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0NThDNDU7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNza3kpIiAvPjxyZWN0IHk9IjE0MCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iNjAiIGZpbGw9InVybCgjc2VhKSIgLz48cmVjdCB5PSIxNDAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2dyYXNzKSIgb3BhY2l0eT0iMC43IiAvPjxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxMTAiIHk9IjcwIiB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTIwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjEzMCIgeT0iNTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxNDAiIHk9IjQwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMjAwIiB5PSIxMDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIzMDAiIHk9IjkwIiB3aWR0aD0iMzAiIGhlaWdodD0iNTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNDAwIiB5PSI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTAwIiB3aWR0aD0iMzUiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjAwIiB5PSI3MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjY1MCIgeT0iNjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI3MDAiIHk9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iOTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNzIwIiB5PSI0MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMTQwIiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNTUwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjY1MCIgY3k9IjEzNyIgcj0iMTMiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUwIiBjeT0iMTQwIiByPSI3IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkR1dGNoIEZvcnQ8L3RleHQ+PC9zdmc+',
        farm: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzI3QUU4NTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxQTczNEY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjVBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iNTAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTUwIiB5PSI5MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjIwMCIgeT0iMTEwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMjUwIiB5PSI4MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjMwMCIgeT0iMTAwIiB3aWR0aD0iMzUiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMzUwIiB5PSI5MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjQwMCIgeT0iMTEwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNDUwIiB5PSI4NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjU1IiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTA1IiB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNTUwIiB5PSI5NSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjYwMCIgeT0iMTE1IiB3aWR0aD0iMzAiIGhlaWdodD0iMjUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjUwIiB5PSI4NSIgd2lkdGg9IjM1IiBoZWlnaHQ9IjU1IiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjcwMCIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUiIGN5PSIxNDAiIHI9IjgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMTI1IiBjeT0iMTM1IiByPSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNzUiIGN5PSIxNDAiIHI9IjciIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMjI1IiBjeT0iMTM4IiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI3NSIgY3k9IjE0MiIgcj0iNiIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIzMjUiIGN5PSIxMzciIHI9IjgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMzc1IiBjeT0iMTQwIiByPSI3IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjQyNSIgY3k9IjEzNSIgcj0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNDc1IiBjeT0iMTQyIiByPSI2IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjUyNSIgY3k9IjEzOCIgcj0iOCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI1NzUiIGN5PSIxNDAiIHI9IjciIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNjI1IiBjeT0iMTM3IiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjY3NSIgY3k9IjE0MiIgcj0iNiIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSI3MjUiIGN5PSIxMzgiIHI9IjgiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUwIiBjeT0iMTQwIiByPSI1IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkZhcm08L3RleHQ+PC9zdmc+',
        company: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM0OThEQkM7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjM0OTUwO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2t5KSIgLz48cmVjdCB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjExMCIgeT0iNzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxMjAiIHk9IjYwIiB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTMwIiB5PSI1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjE0MCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxNTAiIHk9IjMwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMzAwIiB5PSI5MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjM1MCIgeT0iODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI0MDAiIHk9IjcwIiB3aWR0aD0iNjAiIGhlaWdodD0iNzAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNDUwIiB5PSI5MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTAwIiB3aWR0aD0iMzUiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjAwIiB5PSI4MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjY1MCIgeT0iNzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI3MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI3MDAiIHk9IjkwIiB3aWR0aD0iMzAiIGhlaWdodD0iNTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNzUwIiB5PSIxMDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48dGV4dCB4PSI0MDAiIHk9IjMwIiBmb250LWZhbWlseT0iQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5Db21wYW55IENvbnRyb2w8L3RleHQ+PC9zdmc+',
        trek: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOTY0NztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRjc0M0M7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNkZBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTEwIiB3aWR0aD0iNTAiIGhlaWdodD0iMzUiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjUwIiB5PSIxMjUiIHdpZHRoPSIzNSIgaGVpZ2h0PSIyNSIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMTQ1IiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjU1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzAwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkZyZWUgQnVyZ2hlcnM8L3RleHQ+PC9zdmc+'
    },
    britishColonist: {
        intro: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOTY0NztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRjc0M0M7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImdyYXNzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjVBNzQzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ1OEI0NTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NreSkiIC8+PHJlY3QgeT0iMTQwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MCIgZmlsbD0idXJsKCNncmFzcykiIC8+PHJlY3QgeD0iMTAwIiB5PSI4MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxMTAiIHk9IjcwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTIwIiB5PSI2MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjEzMCIgeT0iNTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxNDAiIHk9IjQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTUwIiB5PSIzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjIwMCIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMzAwIiB5PSI5MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjM1MCIgeT0iODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI0MDAiIHk9IjcwIiB3aWR0aD0iNjAiIGhlaWdodD0iNzAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNDUwIiB5PSI5MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iMTAwIiB3aWR0aD0iMzUiIGhlaWdodD0iNDAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjAwIiB5PSI4MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjY1MCIgeT0iNzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI3MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI3MDAiIHk9IjkwIiB3aWR0aD0iMzAiIGhlaWdodD0iNTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNzUwIiB5PSIxMDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMTQwIiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNTUwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjY1MCIgY3k9IjEzNyIgcj0iMTMiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUwIiBjeT0iMTQwIiByPSI3IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkJyaXRpc2ggVG93bjwvdGV4dD48L3N2Zz4=',
        court: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM0OThEQkM7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjM0OTUwO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJncmFzcyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY1QTc0MztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0NThCNDU7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNza3kpIiAvPjxyZWN0IHk9IjE0MCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iNjAiIGZpbGw9InVybCgjZ3Jhc3MpIiAvPjxyZWN0IHg9IjEwMCIgeT0iNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTEwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxMjAiIHk9IjQwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTMwIiB5PSIzMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjE0MCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIxNTAiIHk9IjEwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMTYwIiB5PSIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMzAwIiB5PSI4MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjMxMCIgeT0iNzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSIzMjAiIHk9IjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iMzMwIiB5PSI1MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjQwMCIgeT0iNzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI3MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI0MTAiIHk9IjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNDIwIiB5PSI1MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjUwMCIgeT0iODAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI1MTAiIHk9IjcwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNjAwIiB5PSI5MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjYxMCIgeT0iODAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48cmVjdCB4PSI2MjAiIHk9IjcwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM4QjQ1MTMiIC8+PHJlY3QgeD0iNzAwIiB5PSI4MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI0NTEzIiAvPjxyZWN0IHg9IjcxMCIgeT0iNzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzhCNDUxMyIgLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDAiIHI9IjEwIiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMTQwIiByPSI4IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjEzOCIgcj0iMTEiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNTUwIiBjeT0iMTQyIiByPSI5IiBmaWxsPSIjOEI0NTEzIiAvPjxjaXJjbGUgY3g9IjY1MCIgY3k9IjEzNyIgcj0iMTMiIGZpbGw9IiM4QjQ1MTMiIC8+PGNpcmNsZSBjeD0iNzUwIiBjeT0iMTQwIiByPSI3IiBmaWxsPSIjOEI0NTEzIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPkNvdXJ0PC90ZXh0Pjwvc3ZnPg=='
    }
};

// Game story data - Clean structure
const gameStories = {};

// Khoi-San character data
gameStories.khoisan = {
    scenes: [
        {
            background: 'intro',
            text: "You are Khoi-San, living as herders and hunter-gatherers. The land and cattle are your life. One day in 1652, strange ships appear at the Cape.",
            choices: [
                {
                    text: "Trade cattle with settlers (gain beads and tools)",
                    nextScene: 1,
                    consequence: "trade",
                    historyNote: "The Khoi-San traded with the Dutch at first but later felt cheated as land pressure grew."
                },
                {
                    text: "Refuse trade (protect traditions)",
                    nextScene: 1,
                    consequence: "refuse",
                    historyNote: "The Khoi-San traded with the Dutch at first but later felt cheated as land pressure grew."
                }
            ]
        },
            {
                background: 'conflict',
                text: "Early conflicts begin as settlers push into your grazing lands. You must decide how to respond to their expansion.",
                choices: [
                    {
                        text: "Share grazing land (risk losing access)",
                        nextScene: 2,
                        consequence: "share",
                        historyNote: "Early wars broke out as settlers pushed into grazing lands."
                    },
                    {
                        text: "Defend grazing land (spark fights)",
                        nextScene: 2,
                        consequence: "defend",
                        historyNote: "Early wars broke out as settlers pushed into grazing lands."
                    }
                ]
            },
            {
                background: 'disease',
                text: "A terrible smallpox epidemic sweeps through your community in the late 1600s. Many are dying. The settlers have medicine, but they want something in return.",
                choices: [
                    {
                        text: "Ask settlers for help (medicine, but dependence)",
                        nextScene: 3,
                        consequence: "ask_help",
                        historyNote: "Smallpox devastated Khoi-San communities."
                    },
                    {
                        text: "Stay apart (independence, but many deaths)",
                        nextScene: 3,
                        consequence: "stay_apart",
                        historyNote: "Smallpox devastated Khoi-San communities."
                    }
                ]
            },
            {
                background: 'labor',
                text: "The Dutch farms are growing and they need workers. They offer goods in exchange for labor, but this means working for them regularly.",
                choices: [
                    {
                        text: "Work for settlers (gain goods, lose freedom)",
                        nextScene: 4,
                        consequence: "work",
                        historyNote: "Many Khoi-San became labourers, losing independence."
                    },
                    {
                        text: "Refuse work (face hardship)",
                        nextScene: 4,
                        consequence: "refuse_work",
                        historyNote: "Many Khoi-San became labourers, losing independence."
                    }
                ]
            },
            {
                background: 'migration',
                text: "By the 1700s, the frontier is expanding rapidly. Your traditional lands are being taken over. You must decide where to go.",
                choices: [
                    {
                        text: "Migrate further inland (keep culture, less land)",
                        nextScene: 'ending',
                        consequence: "migrate",
                        historyNote: "Many Khoi-San were displaced or absorbed into settler society."
                    },
                    {
                        text: "Stay near settlers (risk assimilation)",
                        nextScene: 'ending',
                        consequence: "stay_near",
                        historyNote: "Many Khoi-San were displaced or absorbed into settler society."
                    }
                ]
            }
        ],
        endings: {
            trade_share_ask_help_work_migrate: {
                title: "The Path of Adaptation",
                text: "Through trade, cooperation, and adaptation, you survived the challenges of colonial expansion. Your people maintained some independence by moving inland, preserving your culture while facing new hardships."
            },
            trade_share_ask_help_work_stay_near: {
                title: "The Price of Survival",
                text: "Your cooperation with settlers helped you survive, but at the cost of your traditional way of life. Your people became increasingly dependent on settler society, losing much of their cultural independence."
            },
            trade_share_ask_help_refuse_work_migrate: {
                title: "The Struggle for Independence",
                text: "You tried to maintain independence by refusing to work for settlers, but this made life harder. Moving inland preserved some freedom, though with great difficulty."
            },
            trade_share_ask_help_refuse_work_stay_near: {
                title: "The Difficult Balance",
                text: "You sought help during the epidemic but refused to become dependent workers. Staying near settlers while maintaining independence proved extremely challenging."
            },
            trade_share_stay_apart_work_migrate: {
                title: "The Independent Path",
                text: "You maintained independence during the epidemic but later worked for settlers when necessary. Moving inland allowed you to preserve more of your traditional way of life."
            },
            trade_share_stay_apart_work_stay_near: {
                title: "The Compromise",
                text: "You stayed independent during the epidemic but later worked for settlers. This compromise helped you survive while gradually losing some cultural independence."
            },
            trade_share_stay_apart_refuse_work_migrate: {
                title: "The Pure Resistance",
                text: "You maintained complete independence, refusing both help and work. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            trade_share_stay_apart_refuse_work_stay_near: {
                title: "The Hardest Path",
                text: "You maintained complete independence, refusing all settler offers. Staying near them while rejecting their help and work made life extremely difficult."
            },
            trade_defend_ask_help_work_migrate: {
                title: "The Warrior's Adaptation",
                text: "You fought to defend your land but later sought help during the epidemic. Working for settlers and then moving inland showed your ability to adapt while preserving some independence."
            },
            trade_defend_ask_help_work_stay_near: {
                title: "The Warrior's Compromise",
                text: "You fought to defend your land but later cooperated with settlers. This mix of resistance and cooperation helped you survive while gradually losing some independence."
            },
            trade_defend_ask_help_refuse_work_migrate: {
                title: "The Selective Cooperation",
                text: "You fought for your land and sought help during the epidemic but refused to become a regular worker. Moving inland preserved more of your traditional independence."
            },
            trade_defend_ask_help_refuse_work_stay_near: {
                title: "The Selective Resistance",
                text: "You fought for your land and sought help when needed but refused to work for settlers. This selective approach was challenging but maintained more independence."
            },
            trade_defend_stay_apart_work_migrate: {
                title: "The Independent Warrior",
                text: "You fought for your land and stayed independent during the epidemic but later worked for settlers when necessary. Moving inland helped preserve your traditional way of life."
            },
            trade_defend_stay_apart_work_stay_near: {
                title: "The Pragmatic Warrior",
                text: "You fought for your land and stayed independent during the epidemic but later worked for settlers. This pragmatic approach helped you survive while gradually losing some independence."
            },
            trade_defend_stay_apart_refuse_work_migrate: {
                title: "The Pure Warrior",
                text: "You fought for your land and maintained complete independence throughout. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            trade_defend_stay_apart_refuse_work_stay_near: {
                title: "The Ultimate Resistance",
                text: "You fought for your land and maintained complete independence, refusing all settler offers. Staying near them while rejecting everything made life extremely difficult but preserved your dignity."
            },
            refuse_share_ask_help_work_migrate: {
                title: "The Reluctant Adaptation",
                text: "You initially refused trade but later cooperated when necessary. This reluctant adaptation helped you survive while preserving some independence through migration."
            },
            refuse_share_ask_help_work_stay_near: {
                title: "The Reluctant Compromise",
                text: "You initially refused trade but later cooperated when necessary. This reluctant compromise helped you survive while gradually losing some independence."
            },
            refuse_share_ask_help_refuse_work_migrate: {
                title: "The Selective Cooperation",
                text: "You initially refused trade but sought help during the epidemic while refusing to work for settlers. Moving inland preserved more of your traditional independence."
            },
            refuse_share_ask_help_refuse_work_stay_near: {
                title: "The Selective Resistance",
                text: "You initially refused trade but sought help when needed while refusing to work for settlers. This selective approach was challenging but maintained more independence."
            },
            refuse_share_stay_apart_work_migrate: {
                title: "The Independent Survivor",
                text: "You refused trade and stayed independent during the epidemic but later worked for settlers when necessary. Moving inland helped preserve your traditional way of life."
            },
            refuse_share_stay_apart_work_stay_near: {
                title: "The Pragmatic Survivor",
                text: "You refused trade and stayed independent during the epidemic but later worked for settlers. This pragmatic approach helped you survive while gradually losing some independence."
            },
            refuse_share_stay_apart_refuse_work_migrate: {
                title: "The Pure Independence",
                text: "You refused trade and maintained complete independence throughout. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            refuse_share_stay_apart_refuse_work_stay_near: {
                title: "The Ultimate Independence",
                text: "You refused trade and maintained complete independence, refusing all settler offers. Staying near them while rejecting everything made life extremely difficult but preserved your dignity."
            },
            refuse_defend_ask_help_work_migrate: {
                title: "The Warrior's Reluctant Adaptation",
                text: "You refused trade and fought to defend your land but later cooperated when necessary. This reluctant adaptation helped you survive while preserving some independence through migration."
            },
            refuse_defend_ask_help_work_stay_near: {
                title: "The Warrior's Reluctant Compromise",
                text: "You refused trade and fought to defend your land but later cooperated when necessary. This reluctant compromise helped you survive while gradually losing some independence."
            },
            refuse_defend_ask_help_refuse_work_migrate: {
                title: "The Warrior's Selective Cooperation",
                text: "You refused trade and fought for your land but sought help during the epidemic while refusing to work for settlers. Moving inland preserved more of your traditional independence."
            },
            refuse_defend_ask_help_refuse_work_stay_near: {
                title: "The Warrior's Selective Resistance",
                text: "You refused trade and fought for your land but sought help when needed while refusing to work for settlers. This selective approach was challenging but maintained more independence."
            },
            refuse_defend_stay_apart_work_migrate: {
                title: "The Independent Warrior Survivor",
                text: "You refused trade and fought for your land while staying independent during the epidemic but later worked for settlers when necessary. Moving inland helped preserve your traditional way of life."
            },
            refuse_defend_stay_apart_work_stay_near: {
                title: "The Pragmatic Warrior Survivor",
                text: "You refused trade and fought for your land while staying independent during the epidemic but later worked for settlers. This pragmatic approach helped you survive while gradually losing some independence."
            },
            refuse_defend_stay_apart_refuse_work_migrate: {
                title: "The Pure Warrior Independence",
                text: "You refused trade and fought for your land while maintaining complete independence throughout. Moving inland was the only way to preserve your traditional way of life, though with great hardship."
            },
            refuse_defend_stay_apart_refuse_work_stay_near: {
                title: "The Ultimate Warrior Independence",
                text: "You refused trade and fought for your land while maintaining complete independence, refusing all settler offers. Staying near them while rejecting everything made life extremely difficult but preserved your dignity."
            }
        }
};

// Dutch character data
gameStories.dutch = {
        scenes: [
            {
                background: 'intro',
                text: "You arrive with Jan van Riebeeck in 1652. The Dutch East India Company needs farms to supply passing ships. You need food and supplies from the local people.",
                choices: [
                    {
                        text: "Trade cattle fairly with Khoi-San (slow growth, good relations)",
                        nextScene: 1,
                        consequence: "fair_trade",
                        historyNote: "Trade gave way to land seizures and conflict."
                    },
                    {
                        text: "Take land and cattle (start conflict)",
                        nextScene: 1,
                        consequence: "take_land",
                        historyNote: "Trade gave way to land seizures and conflict."
                    }
                ]
            },
            {
                background: 'farm',
                text: "Your farm is growing and you need to decide how to expand. The Khoi-San are using the surrounding lands for grazing.",
                choices: [
                    {
                        text: "Keep farms small (peaceful growth)",
                        nextScene: 2,
                        consequence: "small_farms",
                        historyNote: "Frontier wars spread as settlers expanded inland."
                    },
                    {
                        text: "Expand into Khoi-San lands (spark frontier wars)",
                        nextScene: 2,
                        consequence: "expand",
                        historyNote: "Frontier wars spread as settlers expanded inland."
                    }
                ]
            },
            {
                background: 'labor',
                text: "Your farm is growing, but you need more workers. The Khoi-San are reluctant to work for you regularly.",
                choices: [
                    {
                        text: "Employ Khoi-San workers (strained relations)",
                        nextScene: 3,
                        consequence: "employ_khoisan",
                        historyNote: "Enslaved people from Asia and Africa became central to the Cape economy."
                    },
                    {
                        text: "Import enslaved workers (profits rise, injustice grows)",
                        nextScene: 3,
                        consequence: "import_slaves",
                        historyNote: "Enslaved people from Asia and Africa became central to the Cape economy."
                    }
                ]
            },
            {
                background: 'company',
                text: "The Dutch East India Company wants to control everything, but you want more freedom as a farmer. Other settlers feel the same way.",
                choices: [
                    {
                        text: "Obey Company rules (limited freedom)",
                        nextScene: 4,
                        consequence: "obey_company",
                        historyNote: "Free burghers broke away, creating frontier farmers (Boers)."
                    },
                    {
                        text: "Push for independence (clash with Company)",
                        nextScene: 4,
                        consequence: "push_independence",
                        historyNote: "Free burghers broke away, creating frontier farmers (Boers)."
                    }
                ]
            },
            {
                background: 'trek',
                text: "By the late 1600s and 1700s, the frontier is expanding rapidly. You must decide where to focus your efforts.",
                choices: [
                    {
                        text: "Stay near Cape (safety, less land)",
                        nextScene: 'ending',
                        consequence: "stay_cape",
                        historyNote: "This led to Boer identity and constant frontier conflict."
                    },
                    {
                        text: "Trek inland as frontier farmer (land, but more conflict)",
                        nextScene: 'ending',
                        consequence: "trek_inland",
                        historyNote: "This led to Boer identity and constant frontier conflict."
                    }
                ]
            }
        ],
                    endings: {
                fair_trade_small_farms_employ_khoisan_obey_company_stay_cape: {
                    title: "The Company Man",
                    text: "You chose cooperation over conflict at every turn. Your farm remained small but stable, and you maintained good relations with the Khoi-San. However, you never gained the independence that other settlers sought."
                },
                fair_trade_small_farms_employ_khoisan_obey_company_trek_inland: {
                    title: "The Reluctant Pioneer",
                    text: "Despite your peaceful approach, you eventually joined the trek inland. Your fair treatment of the Khoi-San earned you respect, but you still faced the challenges of frontier life."
                },
                fair_trade_small_farms_employ_khoisan_push_independence_stay_cape: {
                    title: "The Free Burgher",
                    text: "You balanced fair trade with the Khoi-San and pushing for independence from the Company. Your farm grew slowly but steadily, and you became a respected member of the free burgher community."
                },
                fair_trade_small_farms_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Farmer",
                    text: "Your fair treatment of the Khoi-San and push for independence led you to trek inland. You became a successful frontier farmer, known for your fair dealings and independence."
                },
                fair_trade_small_farms_import_slaves_obey_company_stay_cape: {
                    title: "The Company Farmer",
                    text: "You chose to import enslaved workers to grow your farm, while staying loyal to the Company. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                fair_trade_small_farms_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Despite importing enslaved workers, you remained loyal to the Company and trekked inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                fair_trade_small_farms_import_slaves_push_independence_stay_cape: {
                    title: "The Free Farmer",
                    text: "You imported enslaved workers to grow your farm while pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                fair_trade_small_farms_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your use of enslaved workers and push for independence led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                fair_trade_expand_employ_khoisan_obey_company_stay_cape: {
                    title: "The Expanding Farmer",
                    text: "You expanded into Khoi-San lands while employing them as workers and staying loyal to the Company. Your farm grew large, but you faced constant tension with the Khoi-San."
                },
                fair_trade_expand_employ_khoisan_obey_company_trek_inland: {
                    title: "The Expanding Pioneer",
                    text: "Your expansion into Khoi-San lands and employment of them as workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting conflict."
                },
                fair_trade_expand_employ_khoisan_push_independence_stay_cape: {
                    title: "The Independent Expander",
                    text: "You expanded into Khoi-San lands while employing them as workers and pushing for independence from the Company. Your farm grew large, but you faced criticism from all sides."
                },
                fair_trade_expand_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your expansion into Khoi-San lands and push for independence led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                fair_trade_expand_import_slaves_obey_company_stay_cape: {
                    title: "The Company Expander",
                    text: "You expanded into Khoi-San lands and imported enslaved workers while staying loyal to the Company. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                fair_trade_expand_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Your expansion into Khoi-San lands and use of enslaved workers led you to trek inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                fair_trade_expand_import_slaves_push_independence_stay_cape: {
                    title: "The Free Expander",
                    text: "You expanded into Khoi-San lands and imported enslaved workers while pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                fair_trade_expand_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your expansion into Khoi-San lands and use of enslaved workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_small_farms_employ_khoisan_obey_company_stay_cape: {
                    title: "The Land Taker",
                    text: "You took land from the Khoi-San but then chose to keep your farms small and employ them as workers. Your farm remained stable, but you faced constant tension with the Khoi-San."
                },
                take_land_small_farms_employ_khoisan_obey_company_trek_inland: {
                    title: "The Land Taker Pioneer",
                    text: "Your taking of Khoi-San land and employment of them as workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting conflict."
                },
                take_land_small_farms_employ_khoisan_push_independence_stay_cape: {
                    title: "The Independent Land Taker",
                    text: "You took land from the Khoi-San and employed them as workers while pushing for independence from the Company. Your farm grew, but you faced criticism from all sides."
                },
                take_land_small_farms_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and push for independence led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_small_farms_import_slaves_obey_company_stay_cape: {
                    title: "The Company Land Taker",
                    text: "You took land from the Khoi-San and imported enslaved workers while staying loyal to the Company. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                take_land_small_farms_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Your taking of Khoi-San land and use of enslaved workers led you to trek inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                take_land_small_farms_import_slaves_push_independence_stay_cape: {
                    title: "The Free Land Taker",
                    text: "You took land from the Khoi-San and imported enslaved workers while pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                take_land_small_farms_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and use of enslaved workers led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_expand_employ_khoisan_obey_company_stay_cape: {
                    title: "The Expanding Land Taker",
                    text: "You took land from the Khoi-San and expanded into their lands while employing them as workers. Your farm grew large, but you faced constant tension with the Khoi-San."
                },
                take_land_expand_employ_khoisan_obey_company_trek_inland: {
                    title: "The Expanding Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. You became a successful frontier farmer, but your methods created lasting conflict."
                },
                take_land_expand_employ_khoisan_push_independence_stay_cape: {
                    title: "The Independent Expander",
                    text: "You took land from the Khoi-San and expanded into their lands while pushing for independence from the Company. Your farm grew large, but you faced criticism from all sides."
                },
                take_land_expand_employ_khoisan_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                },
                take_land_expand_import_slaves_obey_company_stay_cape: {
                    title: "The Company Expander",
                    text: "You took land from the Khoi-San and expanded into their lands while importing enslaved workers. Your farm prospered, but at the cost of human dignity and your own independence."
                },
                take_land_expand_import_slaves_obey_company_trek_inland: {
                    title: "The Company Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. Your farm grew large, but you faced constant conflict with the Khoi-San and other settlers."
                },
                take_land_expand_import_slaves_push_independence_stay_cape: {
                    title: "The Free Expander",
                    text: "You took land from the Khoi-San and expanded into their lands while importing enslaved workers and pushing for independence from the Company. Your farm prospered, but you faced criticism from both the Company and other settlers."
                },
                take_land_expand_import_slaves_push_independence_trek_inland: {
                    title: "The Independent Pioneer",
                    text: "Your taking of Khoi-San land and expansion into their lands led you to trek inland. You became a successful frontier farmer, but your methods created lasting divisions."
                }
            }
        };

// British character data  
gameStories["britishColonist"] = {
        scenes: [
            {
                background: 'intro',
                text: "It is the late 1700s. The British have taken the Cape from the Dutch. You are sent to help expand British control and bring British law to the colony. The Dutch settlers (Boers) are unhappy about the change.",
                choices: [
                    {
                        text: "Allow Boers autonomy (weaker control)",
                        nextScene: 1,
                        consequence: "allow_autonomy",
                        historyNote: "British rule clashed with Boer traditions."
                    },
                    {
                        text: "Impose British laws (spark Boer anger)",
                        nextScene: 1,
                        consequence: "impose_laws",
                        historyNote: "British rule clashed with Boer traditions."
                    }
                ]
            },
            {
                background: 'court',
                text: "The Khoi-San people are seeking fairness under British rule. They hope the British will treat them better than the Dutch did. You must decide how to handle their requests for equal treatment.",
                choices: [
                    {
                        text: "Protect Khoi-San rights (anger settlers)",
                        nextScene: 2,
                        consequence: "protect_khoisan",
                        historyNote: "The Hottentot Proclamation restricted Khoi-San freedom."
                    },
                    {
                        text: "Enforce pass laws (please settlers, harm Khoi-San)",
                        nextScene: 2,
                        consequence: "enforce_pass_laws",
                        historyNote: "The Hottentot Proclamation restricted Khoi-San freedom."
                    }
                ]
            },
            {
                background: 'court',
                text: "The slavery debate is heating up. Britain is considering abolition, but settlers depend on enslaved labor.",
                choices: [
                    {
                        text: "Support abolition (align with Britain, anger settlers)",
                        nextScene: 3,
                        consequence: "support_abolition",
                        historyNote: "Britain abolished slavery in 1834, causing settler backlash."
                    },
                    {
                        text: "Defend slavery (settlers profit, injustice grows)",
                        nextScene: 3,
                        consequence: "defend_slavery",
                        historyNote: "Britain abolished slavery in 1834, causing settler backlash."
                    }
                ]
            },
            {
                background: 'court',
                text: "The Great Trek is beginning. Thousands of Boers are leaving the Cape to escape British rule.",
                choices: [
                    {
                        text: "Support Boer migration inland (weaker Cape colony)",
                        nextScene: 4,
                        consequence: "support_migration",
                        historyNote: "Thousands of Boers left on the Great Trek."
                    },
                    {
                        text: "Try to stop migration (fuel Boer resentment)",
                        nextScene: 4,
                        consequence: "stop_migration",
                        historyNote: "Thousands of Boers left on the Great Trek."
                    }
                ]
            },
            {
                background: 'court',
                text: "The frontier wars with the Xhosa are intensifying. You must decide how to handle the conflict.",
                choices: [
                    {
                        text: "Negotiate peace (fragile stability)",
                        nextScene: 'ending',
                        consequence: "negotiate_peace",
                        historyNote: "The British fought nine frontier wars with the Xhosa."
                    },
                    {
                        text: "Push military expansion (temporary victory, long resistance)",
                        nextScene: 'ending',
                        consequence: "military_expansion",
                        historyNote: "The British fought nine frontier wars with the Xhosa."
                    }
                ]
            }
        ],
        endings: {
            allow_autonomy_protect_khoisan_support_abolition_support_migration_negotiate_peace: {
                title: "The Peacemaker",
                text: "You chose diplomacy and fairness at every turn. You maintained peace but had limited control over the colony, leading to future instability."
            },
            allow_autonomy_protect_khoisan_support_abolition_support_migration_military_expansion: {
                title: "The Diplomatic Warrior",
                text: "You balanced diplomacy with military action. You maintained some peace but also created lasting conflict through military expansion."
            },
            allow_autonomy_protect_khoisan_support_abolition_stop_migration_negotiate_peace: {
                title: "The Controlled Peacemaker",
                text: "You chose peace and fairness but tried to control Boer migration. This created tension with the Boers while maintaining some stability."
            },
            allow_autonomy_protect_khoisan_support_abolition_stop_migration_military_expansion: {
                title: "The Controlled Warrior",
                text: "You balanced fairness with control and military action. This created lasting conflict with both Boers and Xhosa."
            }
        }
};

// Game functions
function startGame(character) {
    currentCharacter = character;
    currentScene = 0;
    gameHistory = [];
    
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('endingScreen').style.display = 'none';
    
    showScene();
}

function showScene() {
    const story = gameStories[currentCharacter];
    const scene = story.scenes[currentScene];
    
    // Set background
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.style.backgroundImage = `url(${backgrounds[currentCharacter][scene.background]})`;
    
    // Set story text
    document.getElementById('storyText').textContent = scene.text;
    
    // Clear and populate choices
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    scene.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.onclick = () => makeChoice(choice);
        choicesContainer.appendChild(button);
    });
}

function makeChoice(choice) {
    gameHistory.push(choice.consequence);
    
    // Show historical context if available
    if (choice.historyNote) {
        showHistoricalContext(choice.historyNote, () => {
            if (choice.nextScene === 'ending') {
                showEnding();
            } else {
                currentScene = choice.nextScene;
                showScene();
            }
        });
    } else {
        if (choice.nextScene === 'ending') {
            showEnding();
        } else {
            currentScene = choice.nextScene;
            showScene();
        }
    }
}

function showHistoricalContext(historyNote, callback) {
    // Create a modal overlay for historical context
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(44, 62, 80, 0.95);
        border: 3px solid #f39c12;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = "📚 Historical Context";
    title.style.cssText = `
        color: #f39c12;
        font-size: 1.5em;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
    `;
    
    const text = document.createElement('p');
    text.textContent = historyNote;
    text.style.cssText = `
        color: #ecf0f1;
        font-size: 1.1em;
        line-height: 1.6;
        margin-bottom: 30px;
        font-family: 'Courier New', monospace;
    `;
    
    const button = document.createElement('button');
    button.textContent = "Continue";
    button.style.cssText = `
        background: rgba(46, 204, 113, 0.8);
        border: 2px solid #2ecc71;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        font-family: 'Courier New', monospace;
        transition: all 0.3s ease;
    `;
    
    button.onmouseover = () => {
        button.style.background = 'rgba(46, 204, 113, 1)';
    };
    
    button.onmouseout = () => {
        button.style.background = 'rgba(46, 204, 113, 0.8)';
    };
    
    button.onclick = () => {
        document.body.removeChild(overlay);
        callback();
    };
    
    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function showEnding() {
    const story = gameStories[currentCharacter];
    const endingKey = gameHistory.join('_');
    const ending = story.endings[endingKey];
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'block';
    
    document.getElementById('endingTitle').textContent = ending.title;
    
    // Add the main ending text plus encouragement to replay
    const endingText = ending.text + "\n\n" + 
        "Try another character to see history from a different perspective!";
    
    document.getElementById('endingText').textContent = endingText;
}

function goBack() {
    document.getElementById('titleScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    
    currentCharacter = '';
    currentScene = 0;
    gameHistory = [];
}

function restartGame() {
    goBack();
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    // Game is ready to play!
    console.log('Voices of the Past: South Africa - Game Ready!');
});

// End of file

// ============================================================
//  구단 가이드 데이터 — club.html?key=<slug> 와 index.html이 읽음
//  key: BBC 팀 슬러그. 2026-27 프리미어리그 20팀.
//  manager / keyPlayers: 2026-27 시즌 개막 기준. 시즌 중 변동은 손으로 갱신한다.
//  stadium.capacity / opened: 영어 위키백과 구장 문서 인포박스 확인값.
//  stadium.photo: 위키미디어 커먼즈 자유 라이선스 사진. credit/license 표기 필수.
//  watch: 이번 시즌 관전 포인트 — 순위·승점·최근 결과 언급 금지 (시즌 중 무의미해짐)
// ============================================================
window.HUB_CLUBS = {

"arsenal": {
  name:"Arsenal", short:"Arsenal", ko:"아스널", abbr:"ARS",
  nick:"거너스", founded:1886, city:"런던",
  color:"#EF0107", color2:"#063672",
  stadium:{ name:"Emirates Stadium", ko:"에미레이츠 스타디움", capacity:60704, opened:2006,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/London_Emirates_Stadium_arsenal.jpg/1280px-London_Emirates_Stadium_arsenal.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:London_Emirates_Stadium_arsenal.jpg" } },
  manager:{ name:"Mikel Arteta", ko:"미켈 아르테타", since:2019 },
  keyPlayers:[
    { name:"David Raya", ko:"다비드 라야", pos:"GK" },
    { name:"William Saliba", ko:"윌리엄 살리바", pos:"DF" },
    { name:"Declan Rice", ko:"데클란 라이스", pos:"MF" },
    { name:"Bukayo Saka", ko:"부카요 사카", pos:"MF" },
    { name:"Viktor Gyökeres", ko:"빅토르 요케레스", pos:"FW" }
  ],
  intro:"런던 북부의 명문. 1913년 하이버리(Highbury)로 옮겨온 뒤 잉글랜드 1부에서 가장 오래 연속으로 버틴 구단이며, 아르센 벵거(Arsène Wenger) 시대에 패스 축구의 상징이 됐다. 미켈 아르테타 아래에서 조직적인 압박과 세트피스 완성도로 다시 정상권 경쟁에 복귀했다.",
  history:[
    { y:1913, t:"템스강을 건너다", d:"울리치(Woolwich)에서 하이버리로 연고를 옮기며 북런던 구단이 됐다. 이 이사가 토트넘과의 앙금, 즉 북런던 더비의 출발점이다." },
    { y:1971, t:"첫 더블", d:"리그와 FA컵을 같은 시즌에 제패. 리그 우승을 확정한 곳이 하필 토트넘의 홈 화이트 하트 레인(White Hart Lane)이었다." },
    { y:2004, t:"무패 우승", d:"리그 38경기 무패로 우승해 '인빈시블스(Invincibles)'라 불렸다. 이 무패 행진은 이듬해 10월 올드 트래퍼드에서 맨유에 0-2로 지며 49경기에서 끝났다." },
    { y:2006, t:"에미레이츠 이적", d:"93년을 보낸 하이버리를 떠나 6만 석 규모의 새 구장으로. 재정 부담이 컸던 이 이사가 이후 10여 년의 긴축 시대를 규정했다." },
    { y:2025, t:"위르첸 시대의 스쿼드", d:"요케레스, 수비미들 보강 등 대형 영입으로 스쿼드 깊이를 두껍게 하며 아르테타 체제의 완성을 노렸다." }
  ],
  relations:{
    "manchester-united":"맨유와 아스널은 1990년대 후반부터 2000년대 중반까지 프리미어리그를 반으로 나눠 가진 사이다. 로이 킨(Roy Keane)과 파트리크 비에라(Patrick Vieira)가 터널에서 맞붙던 장면, 2003년 올드 트래퍼드에서 판 니스텔로이(Ruud van Nistelrooy)가 페널티킥을 크로스바에 맞힌 뒤 아스널 선수들이 그를 둘러싼 '올드 트래퍼드 전투'가 이 시기를 요약한다. 2004년 10월 무패 49경기를 끊은 것도 올드 트래퍼드였고, 경기 후 라커룸 복도에서 음식이 날아다닌 이른바 '피자게이트'로 이어졌다. 요즘은 예전 같은 살벌함은 덜하지만, 두 구단의 맞대결은 여전히 시즌의 무게중심이 걸린 경기로 취급된다.",
    "tottenham-hotspur":"북런던 더비. 원래 남동런던 울리치(Woolwich)에 있던 아스널이 1913년 토트넘에서 몇 킬로미터 떨어진 하이버리로 이사 오면서 시작됐고, 1919년 1부 확대 개편 때 2부 5위였던 아스널이 승격하고 토트넘이 강등된 일이 앙금을 굳혔다. 토트넘 팬에게 가장 쓰라린 장면은 아스널이 화이트 하트 레인에서 우승을 확정한 두 번, 1971년 더블과 2004년 무패 우승 시즌이다. 2001년 솔 캠벨(Sol Campbell)이 계약 만료로 토트넘을 떠나 아스널로 넘어간 이적은 지금도 이 더비의 상징적 배신으로 불린다. 오랫동안 아스널이 순위에서 앞서는 것이 기본값이었지만 2016-17 시즌 토트넘이 22년 만에 아스널을 앞질렀고, 그 뒤로는 순위표에서 서로를 넘나드는 관계가 됐다."
  },
  watch:[
    "아르테타 8년 차: 장기 프로젝트가 트로피로 환산되는지가 매 시즌 같은 질문으로 돌아온다.",
    "요케레스 중심의 공격 구조: 최전방에 확실한 기준점을 둔 뒤 사카·라이스와의 연결이 얼마나 자동화됐는지.",
    "챔피언스리그와 리그의 병행: 주중 유럽 일정이 주말 강도에 미치는 영향, 그리고 로테이션 폭."
  ]
},

"aston-villa": {
  name:"Aston Villa", short:"Aston Villa", ko:"애스턴 빌라", abbr:"AVL",
  nick:"빌런스", founded:1874, city:"버밍엄",
  color:"#670E36", color2:"#95BFE5",
  stadium:{ name:"Villa Park", ko:"빌라 파크", capacity:43205, opened:1897,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Birmingham_aston_villa_park_stadium.jpg/1280px-Birmingham_aston_villa_park_stadium.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:Birmingham_aston_villa_park_stadium.jpg" } },
  manager:{ name:"Unai Emery", ko:"우나이 에메리", since:2022 },
  keyPlayers:[
    { name:"Pau Torres", ko:"파우 토레스", pos:"DF" },
    { name:"Boubacar Kamara", ko:"부바카르 카마라", pos:"MF" },
    { name:"John McGinn", ko:"존 맥긴", pos:"MF" },
    { name:"Alejandro Garnacho", ko:"알레한드로 가르나초", pos:"FW" },
    { name:"Nicolas Jackson", ko:"니콜라 잭슨", pos:"FW" }
  ],
  intro:"1888년 풋볼리그(Football League) 창립 멤버이자 잉글랜드에서 유럽 챔피언에 오른 다섯 구단 중 하나. 오랜 침체기와 3부 강등까지 겪은 뒤 우나이 에메리 체제에서 다시 유럽 무대 단골이 됐다. 빌라 파크의 홀트 엔드(Holte End)는 잉글랜드에서 가장 큰 단층 관중석으로 꼽힌다.",
  history:[
    { y:1874, t:"교회 크리켓팀에서 시작", d:"애스턴의 위슬리 웨슬리안 교회(Villa Cross Wesleyan Chapel) 신자들이 겨울 운동거리로 만든 팀. 창립 멤버 윌리엄 맥그레거(William McGregor)가 훗날 풋볼리그를 만들었다." },
    { y:1982, t:"유러피언컵 우승", d:"로테르담에서 바이에른 뮌헨을 1-0으로 꺾었다. 부상으로 급히 투입된 무명 골키퍼 나이절 스핑크(Nigel Spink)의 선방이 결승전을 지켰다." },
    { y:2016, t:"1부 탈락", d:"1988년 승격 이후 28년 만에 강등. 이후 3년을 2부에서 보내고 2019년 플레이오프로 돌아왔다." },
    { y:2022, t:"에메리 부임", d:"유로파리그를 네 번 들어올린 감독이 강등권 근처의 팀을 맡아 유럽 대항전 경쟁권으로 끌어올렸다." }
  ],
  relations:{
    "manchester-united":"맨유 팬에게 빌라 파크는 오랫동안 준결승 장소로 익숙한 곳이었고, 애스턴 빌라는 결정적인 순간마다 발목을 잡은 팀이다. 가장 아픈 기억은 1994년 리그컵 결승. 트레블을 노리던 맨유가 빌라에 1-3으로 졌고, 마크 보스니치(Mark Bosnich)의 선방과 딘 손더스(Dean Saunders)의 마무리가 시즌의 한 축을 무너뜨렸다. 반대로 1957년 FA컵 결승에서는 빌라가 골키퍼 레이 우드(Ray Wood)를 부상으로 몰아내며 '버스비 베이브스(Busby Babes)'의 더블을 막아섰다. 최근에는 두 구단이 같은 유럽 티켓을 놓고 다투는 일이 잦아지면서 맞대결의 체감 무게가 다시 올라갔다.",
    "tottenham-hotspur":"토트넘과 애스턴 빌라 사이에 지역적 앙금은 없지만 컵 대회로 남은 접점은 분명하다. 1971년 리그컵 결승에서 토트넘이 당시 3부 소속이던 빌라를 꺾고 우승했는데, 3부 팀의 결승 진출 자체가 그해 최대 화제였다. 빌라 파크는 오랫동안 FA컵 준결승 중립 경기장으로 자주 쓰여 토트넘 팬들이 컵 대회 원정으로 익숙한 곳이기도 하다. 다런 벤트(Darren Bent)처럼 화이트 하트 레인을 거쳐 빌라 파크에 자리 잡은 공격수도 있다. 최근에는 두 구단이 같은 유럽 대항전 티켓을 놓고 다투는 일이 잦아지면서 맞대결의 체감 무게가 올라갔다."
  },
  watch:[
    "에메리의 다섯 번째 시즌: 유럽 대항전 진출을 상수로 만든 뒤, 그다음 단계가 무엇인지.",
    "가르나초의 적응: 맨유 유스 출신 윙어가 빌라 파크에서 어떤 역할을 부여받는지.",
    "재정 규정과 스쿼드 운용: 유럽 병행과 PSR 제약 사이에서 로테이션을 어떻게 짜는지."
  ]
},

"afc-bournemouth": {
  name:"AFC Bournemouth", short:"Bournemouth", ko:"AFC 본머스", abbr:"BOU",
  nick:"체리스", founded:1899, city:"본머스",
  color:"#DA291C", color2:"#000000",
  stadium:{ name:"Vitality Stadium (Dean Court)", ko:"바이탤리티 스타디움 (딘 코트)", capacity:12357, opened:1910,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Deancourt_14092013_vblackpool.jpg/1280px-Deancourt_14092013_vblackpool.jpg",
      credit:"Matthew Jackson", license:"CC BY-SA 3.0",
      source:"https://commons.wikimedia.org/wiki/File:Deancourt_14092013_vblackpool.jpg" } },
  manager:{ name:"Marco Rose", ko:"마르코 로제", since:2026 },
  keyPlayers:[
    { name:"Đorđe Petrović", ko:"조르제 페트로비치", pos:"GK" },
    { name:"Bafodé Diakité", ko:"바포데 디아키테", pos:"DF" },
    { name:"Alex Scott", ko:"알렉스 스콧", pos:"MF" },
    { name:"Justin Kluivert", ko:"유스틴 클라위베르트", pos:"FW" },
    { name:"Evanilson", ko:"에바닐송", pos:"FW" }
  ],
  intro:"프리미어리그에서 가장 작은 구장을 쓰는 남부 해안 도시 구단. 2008년 파산 직전까지 갔다가 4부에서 1부까지 올라온 이력이 정체성 그 자체다. 안도니 이라올라(Andoni Iraola) 시절 다져진 강한 전방 압박과 저평가 선수 발굴이 구단의 색으로 남았다.",
  history:[
    { y:2008, t:"청산 직전", d:"관리 절차에 들어가 승점 17점을 삭감당한 채 4부에서 시즌을 시작했다. 잔류 자체가 기적으로 불렸고, 당시 선수였던 에디 하우(Eddie Howe)가 감독으로 팀을 구했다." },
    { y:2015, t:"사상 첫 1부 승격", d:"챔피언십 우승으로 창단 116년 만에 최상위 리그에 올랐다. 리그 역사상 최소 규모 구장을 가진 승격팀이었다." },
    { y:2020, t:"강등과 복귀", d:"5년 만에 2부로 내려갔지만 2022년 곧바로 자동 승격으로 돌아왔다." },
    { y:2026, t:"이라올라의 이적과 로제 부임", d:"3년간 팀을 재건한 이라올라가 리버풀로 떠나고, 마르코 로제가 지휘봉을 이어받았다." }
  ],
  relations:{
    "manchester-united":"맨유와 본머스 사이에 역사적 앙금은 없지만, 두 구단의 만남은 유독 기묘한 장면을 남겼다. 2016년 시즌 최종전 올드 트래퍼드 경기는 경기장에서 발견된 모형 폭발물 탓에 킥오프 직전 취소돼 사흘 뒤 다시 치러졌다. 프리미어리그 역사상 처음으로 관중을 대피시킨 뒤 무산된 경기였다. 최근에는 본머스가 바이탤리티 스타디움에서 맨유를 상대로 좋은 결과를 여러 번 만들며, 작은 구장 특유의 밀착된 분위기가 원정팀에 불편한 곳이라는 인식을 만들었다.",
    "tottenham-hotspur":"두 구단의 리그 맞대결 역사는 본머스가 처음 승격한 2015년에야 시작될 만큼 짧다. 대신 사람으로 이어진 접점이 있다. 해리 레드냅(Harry Redknapp)은 1980년대 딘 코트에서 감독으로 이름을 알렸고, 20여 년 뒤 토트넘을 맡아 챔피언스리그 8강까지 올려놓았다. 1만 2천 석 남짓한 바이탤리티 스타디움은 관중석이 피치에 바짝 붙어 있어, 공을 오래 쥐고 경기를 풀려는 팀이 리듬을 잃기 쉬운 원정지로 꼽힌다. 일정표에서는 만만해 보이지만 토트넘이 이곳에서 승점을 흘린 경기가 반복되면서, 실제로는 까다로운 날로 분류된다."
  },
  watch:[
    "로제 체제의 첫 시즌: 이라올라가 남긴 압박 구조를 이어받을지, 자기 색으로 바꿀지.",
    "핵심 자원 이탈 이후의 재조립: 매 여름 주축을 팔고 다시 채우는 구단 모델이 이번에도 통하는지.",
    "1만 2천 석의 이점: 리그 최소 규모 홈에서 만드는 압박감이 여전히 원정팀을 괴롭히는지."
  ]
},

"brentford": {
  name:"Brentford", short:"Brentford", ko:"브렌트포드", abbr:"BRE",
  nick:"비스", founded:1889, city:"런던",
  color:"#E30613", color2:"#FFFFFF",
  stadium:{ name:"Gtech Community Stadium", ko:"지테크 커뮤니티 스타디움", capacity:17250, opened:2020,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Brentford_Community_Stadium_2020.jpg/1280px-Brentford_Community_Stadium_2020.jpg",
      credit:"AndyScott", license:"CC BY-SA 4.0",
      source:"https://commons.wikimedia.org/wiki/File:Brentford_Community_Stadium_2020.jpg" } },
  manager:{ name:"Keith Andrews", ko:"키스 앤드루스", since:2025 },
  keyPlayers:[
    { name:"Caoimhín Kelleher", ko:"키빈 켈러허", pos:"GK" },
    { name:"Nathan Collins", ko:"네이선 콜린스", pos:"DF" },
    { name:"Mikkel Damsgaard", ko:"미켈 담스고르", pos:"MF" },
    { name:"Kevin Schade", ko:"케빈 샤데", pos:"FW" },
    { name:"Igor Thiago", ko:"이고르 치아구", pos:"FW" }
  ],
  intro:"데이터 분석으로 운영되는 서런던의 실험실. 도박사 출신 구단주 매튜 벤엄(Matthew Benham)이 통계 모델로 선수를 사고팔며 74년 만에 1부로 올려놓았다. 세트피스와 롱스로인, 전환 속도에 특화된 팀으로, 적은 예산 대비 효율의 교과서로 자주 인용된다.",
  history:[
    { y:1947, t:"1부에서의 마지막 시즌", d:"전후 첫 시즌에 강등된 뒤 브렌트포드는 74년간 최상위 리그로 돌아오지 못했다." },
    { y:2012, t:"승격을 놓친 마지막 순간", d:"리그1 최종전 종료 직전 페널티킥이 골대를 맞고 나온 뒤 역습으로 실점. 이 장면이 구단 운영 방식을 전면 재검토하는 계기가 됐다." },
    { y:2020, t:"그리핀 파크를 떠나다", d:"네 모퉁이에 모두 펍이 있던 것으로 유명한 그리핀 파크(Griffin Park)를 104년 만에 떠나 새 구장으로 이사했다." },
    { y:2021, t:"74년 만의 1부 복귀", d:"챔피언십 플레이오프 결승에서 스완지를 꺾고 승격. 프리미어리그 출범 이후 처음으로 최상위 무대를 밟았다." }
  ],
  relations:{
    "manchester-united":"브렌트포드가 맨유 팬의 기억에 새겨진 날은 2022년 8월 13일이다. 시즌 두 번째 경기에서 홈팀이 전반 35분 만에 4골을 몰아넣어 4-0으로 끝냈고, 이 경기는 에릭 텐 하흐(Erik ten Hag) 체제 초반의 위기를 상징하는 장면이 됐다. 그전까지 두 구단은 1930년대 이후 리그에서 마주칠 일조차 거의 없었다. 짧은 역사에도 불구하고 지테크 커뮤니티 스타디움은 맨유에게 방심할 수 없는 원정지로 자리 잡았고, 세트피스 한 방에 흐름이 뒤집히는 경기가 반복되고 있다.",
    "tottenham-hotspur":"서런던과 북런던의 만남이지만 브렌트포드가 74년 만에 1부로 올라온 2021년에야 정기적으로 마주치기 시작한 사이다. 지테크 커뮤니티 스타디움은 좁고 관중과의 거리가 가까워, 토트넘이 세트피스나 롱스로인 한 방에 흐름을 내주는 경기가 여러 번 나왔다. 박싱데이 원정에서 전반에 두 골을 내주고도 후반에 따라붙어 비긴 경기가 최근 맞대결 중 가장 많이 회자된다. 토트넘에서 오래 뛴 크리스티안 에릭센(Christian Eriksen)이 심장 이상으로 쓰러진 뒤 프리미어리그 복귀 무대로 고른 곳이 브렌트포드였다는 점도 두 구단을 잇는 이야기다. 규모 차이와 무관하게 토트넘 팬들이 방심하지 않는 원정지가 됐다."
  },
  watch:[
    "앤드루스 2년 차: 코치에서 승격한 감독이 구단의 데이터 모델과 어떻게 맞물리는지.",
    "매 시즌 반복되는 주축 매각: 이번에도 판 만큼 잘 채웠는지가 시즌 초반에 드러난다.",
    "세트피스 의존도: 리그가 대응법을 학습한 뒤에도 같은 무기가 통하는지."
  ]
},

"brighton-and-hove-albion": {
  name:"Brighton & Hove Albion", short:"Brighton", ko:"브라이턴 앤 호브 앨비언", abbr:"BHA",
  nick:"시걸스", founded:1901, city:"브라이턴",
  color:"#0057B8", color2:"#FFFFFF",
  stadium:{ name:"American Express Stadium (Falmer)", ko:"아메리칸 익스프레스 스타디움 (팰머)", capacity:32176, opened:2011,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Amex_Community_Stadium.jpg/1280px-Amex_Community_Stadium.jpg",
      credit:"Barbara van Cleve", license:"CC BY-SA 4.0",
      source:"https://commons.wikimedia.org/wiki/File:Amex_Community_Stadium.jpg" } },
  manager:{ name:"Fabian Hürzeler", ko:"파비안 휘르첼러", since:2024 },
  keyPlayers:[
    { name:"Bart Verbruggen", ko:"바르트 페르브뤼헌", pos:"GK" },
    { name:"Lewis Dunk", ko:"루이스 덩크", pos:"DF" },
    { name:"Kaoru Mitoma", ko:"미토마 가오루", pos:"MF" },
    { name:"Matt O'Riley", ko:"맷 오라일리", pos:"MF" },
    { name:"Georginio Rutter", ko:"조르지니오 뤼테르", pos:"FW" }
  ],
  intro:"남부 해안의 스카우팅 강자. 도박 통계업자 출신 구단주 토니 블룸(Tony Bloom)이 세운 영입 모델로 무명 선수를 사서 대형 구단에 파는 순환 구조를 만들었다. 후방부터 촘촘히 빌드업하는 축구를 유지하면서도 감독이 바뀔 때마다 팀 색이 크게 흔들리지 않는 점이 이 구단의 특징이다.",
  history:[
    { y:1983, t:"'스미스는 넣어야만 한다'", d:"FA컵 결승에서 맨유와 2-2로 비긴 연장 마지막 순간, 고든 스미스(Gordon Smith)의 단독 찬스를 중계 해설이 예고했지만 막혔다. 재경기에서 0-4로 졌고 같은 해 강등됐다." },
    { y:1997, t:"소멸 직전", d:"홈 구장 골드스톤 그라운드(Goldstone Ground)가 팔리고 리그 최하위권까지 떨어져 구단이 사라질 뻔했다. 이후 15년간 임시 구장을 전전했다." },
    { y:2011, t:"팰머의 새 구장", d:"오랜 인허가 싸움 끝에 아메리칸 익스프레스 스타디움 개장. 이 구장이 이후 승격과 프리미어리그 정착의 토대가 됐다." },
    { y:2017, t:"창단 첫 1부 승격", d:"116년 만에 최상위 리그 진입. 이후 유럽 대항전 진출까지 이어지며 잔류팀에서 경쟁팀으로 위상이 바뀌었다." }
  ],
  relations:{
    "manchester-united":"두 구단의 가장 큰 접점은 1983년 FA컵 결승이다. 2부였던 브라이턴이 맨유와 2-2로 비겼고, 연장 종료 직전 '스미스는 넣어야만 한다'는 중계 멘트와 함께 온 결정적 기회가 무산됐다. 재경기에서 0-4 완패. 이 문장은 지금도 브라이턴 팬진의 이름으로 쓰인다. 40년 뒤인 2023년 FA컵 준결승에서는 웸블리에서 다시 만나 0-0 뒤 승부차기로 브라이턴이 이겼다. 최근에는 아멕스 원정이 맨유에게 까다로운 일정으로 굳어졌고, 브라이턴의 빌드업을 어떻게 막을지가 매번 경기의 주제가 된다.",
    "tottenham-hotspur":"2026-27 시즌 이 경기의 주인공은 감독이다. 로베르토 데 제르비(Roberto De Zerbi)가 브라이턴에서 두 시즌 동안 후방 유인 빌드업으로 리그의 화제를 만들고 구단 사상 첫 유럽 대항전 진출까지 이끈 뒤, 지금은 토트넘 벤치에 앉아 있다. 아멕스 원정은 그전에도 편한 적이 없었다. 브라이턴이 후방부터 촘촘히 공을 굴리며 상대 압박을 유인하는 방식이 토트넘의 전방 수비와 정면으로 부딪히기 때문이다. 이브 비수마(Yves Bissouma)가 아멕스에서 북런던으로 옮겨온 것처럼 선수 이동도 이어졌고, 여기에 데 제르비의 복귀전이라는 개인적 서사까지 얹혔다."
  },
  watch:[
    "휘르첼러 3년 차: 최연소 감독으로 시작한 실험이 어떤 축구로 정착했는지.",
    "미토마와 측면 공격: 1대1 돌파에 의존하는 구간과 조합 플레이의 균형.",
    "판매와 재투자의 순환: 여름마다 주축을 팔면서도 전력이 유지되는지."
  ]
},

"chelsea": {
  name:"Chelsea", short:"Chelsea", ko:"첼시", abbr:"CHE",
  nick:"블루스", founded:1905, city:"런던",
  color:"#034694", color2:"#FFFFFF",
  stadium:{ name:"Stamford Bridge", ko:"스탬퍼드 브리지", capacity:40044, opened:1877,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/London_Stamford_Bridge.jpg/1280px-London_Stamford_Bridge.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:London_Stamford_Bridge.jpg" } },
  manager:{ name:"Xabi Alonso", ko:"사비 알론소", since:2026 },
  keyPlayers:[
    { name:"Emiliano Martínez", ko:"에밀리아노 마르티네스", pos:"GK" },
    { name:"Levi Colwill", ko:"레비 콜윌", pos:"DF" },
    { name:"Moisés Caicedo", ko:"모이세스 카이세도", pos:"MF" },
    { name:"Cole Palmer", ko:"콜 파머", pos:"MF" },
    { name:"Estêvão Willian", ko:"에스테방 윌리앙", pos:"FW" }
  ],
  intro:"서런던의 자본 구단. 2003년 로만 아브라모비치(Roman Abramovich) 인수 이후 20년간 유럽 정상급에 머물렀고, 2022년 미국 컨소시엄 블루코(BlueCo)로 주인이 바뀐 뒤로는 20대 초반 선수를 대량으로 사들여 장기 계약으로 묶는 공격적 스쿼드 전략을 쓰고 있다. 스탬퍼드 브리지는 1877년 개장한 잉글랜드에서 손꼽히게 오래된 경기장이다.",
  history:[
    { y:1955, t:"첫 리그 우승", d:"창단 50년 만의 1부 타이틀. 이후 반세기 동안 리그 정상에 다시 오르지 못했다." },
    { y:2003, t:"아브라모비치 인수", d:"러시아 자본이 들어오며 잉글랜드 축구의 이적 시장 규모 자체가 달라졌다. 이듬해 조제 무리뉴(José Mourinho)가 부임한다." },
    { y:2012, t:"뮌헨에서의 챔피언스리그", d:"바이에른의 홈에서 열린 결승에서 디디에 드로그바(Didier Drogba)의 동점골과 승부차기로 첫 빅이어를 들었다." },
    { y:2021, t:"두 번째 유럽 정상", d:"토마스 투헬(Thomas Tuchel) 부임 넉 달 만에 맨시티를 1-0으로 꺾고 챔피언스리그 우승." },
    { y:2025, t:"클럽 월드컵 우승", d:"확대 개편된 첫 대회에서 우승하며 블루코 체제의 어린 스쿼드가 처음으로 큰 트로피를 들었다." }
  ],
  relations:{
    "manchester-united":"맨유와 첼시의 관계는 2000년대 중반에 가장 뜨거웠다. 무리뉴의 첼시가 알렉스 퍼거슨(Alex Ferguson)의 맨유에게서 리그를 두 번 연속 빼앗아 갔고, 두 감독의 신경전이 시즌 내내 화제였다. 정점은 2008년 모스크바 챔피언스리그 결승. 비 내리는 루즈니키에서 1-1 뒤 승부차기로 맨유가 이겼고, 존 테리(John Terry)가 미끄러져 놓친 킥이 영국 축구사에서 가장 많이 재생된 장면 중 하나가 됐다. 이후 무리뉴가 맨유 지휘봉을 잡으며 감정선이 한 번 더 꼬였고, 지금도 두 팀의 맞대결은 감독의 명운이 걸린 경기로 다뤄지는 일이 많다.",
    "tottenham-hotspur":"런던 더비이면서 토트넘 팬에게는 오래 참아야 했던 상대다. 1990년 이후 16년 넘게 리그에서 첼시를 이기지 못한 시기가 있었고, 그동안 이 경기는 자조와 함께 치러졌다. 반대편에는 2008년 리그컵 결승이 있는데, 웸블리에서 연장 끝에 첼시를 꺾고 든 이 트로피가 2025년 유로파리그 우승 전까지 토트넘의 마지막 우승이었다. 2016년 5월 스탬퍼드 브리지의 이른바 '브리지 전투'는 토트넘의 우승 도전이 끝난 경기이자 한 경기 경고 기록이 쏟아진 난투였고, 그 무승부로 레스터의 우승이 확정됐다. 조제 무리뉴(José Mourinho)가 두 구단을 모두 지휘한 것까지 더해 감정선이 여러 겹으로 얽혀 있다."
  },
  watch:[
    "알론소의 첫 시즌: 레버쿠젠에서 보여준 3백 기반 구조를 첼시의 어린 스쿼드에 이식할 수 있는지.",
    "파머 중심의 공격: 한 명에게 창의성을 의존하는 구조에서 벗어날 대안이 나오는지.",
    "과잉 스쿼드 정리: 대규모 영입 이후 남은 인원을 어떻게 정돈하는지."
  ]
},

"coventry-city": {
  name:"Coventry City", short:"Coventry", ko:"코번트리 시티", abbr:"COV",
  nick:"스카이 블루스", founded:1883, city:"코번트리",
  color:"#78D0F5", color2:"#041E42",
  stadium:{ name:"Coventry Building Society Arena", ko:"코번트리 빌딩 소사이어티 아레나", capacity:32609, opened:2005,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Coventry_Derby_October_2021_-_2.jpg/1280px-Coventry_Derby_October_2021_-_2.jpg",
      credit:"Amakuru", license:"CC BY-SA 4.0",
      source:"https://commons.wikimedia.org/wiki/File:Coventry_Derby_October_2021_-_2.jpg" } },
  manager:{ name:"Frank Lampard", ko:"프랭크 램파드", since:2024 },
  keyPlayers:[
    { name:"Carl Rushworth", ko:"칼 러시워스", pos:"GK" },
    { name:"Ethan Pinnock", ko:"이선 피녹", pos:"DF" },
    { name:"Jack Rudoni", ko:"잭 루도니", pos:"MF" },
    { name:"Ellis Simms", ko:"엘리스 심스", pos:"FW" },
    { name:"Haji Wright", ko:"하지 라이트", pos:"FW" }
  ],
  intro:"25년 만에 최상위 리그로 돌아온 웨스트미들랜즈의 구단. 1967년부터 2001년까지 34년 연속 1부에 머물렀지만, 강등 이후에는 3부 추락과 홈 구장을 잃고 다른 도시에서 홈경기를 치르는 시기까지 겪었다. 2026년 챔피언십 우승으로 완전히 다른 국면에 들어섰다.",
  history:[
    { y:1967, t:"1부 진입", d:"지미 힐(Jimmy Hill) 감독 아래 하늘색 유니폼과 '스카이 블루스'라는 정체성을 만들며 처음으로 최상위 리그에 올랐다. 이후 34년을 버텼다." },
    { y:1987, t:"FA컵 우승", d:"웸블리에서 토트넘을 연장 끝에 3-2로 꺾은 구단 유일의 메이저 트로피." },
    { y:2001, t:"34년 만의 강등", d:"1부 탈락 이후 재정 악화가 이어지며 2017년에는 4부까지 떨어졌다." },
    { y:2024, t:"웸블리의 3-3", d:"37년 만의 FA컵 준결승에서 맨유에 0-3으로 끌려가다 추가시간에 3-3을 만들었고, 역전골이 오프사이드로 취소된 뒤 승부차기에서 졌다." },
    { y:2026, t:"챔피언십 우승과 승격", d:"구단 사상 첫 챔피언십 우승으로 25년 만에 프리미어리그로 복귀했다." }
  ],
  relations:{
    "manchester-united":"맨유 팬에게 코번트리는 2024년 4월 웸블리로 기억된다. 3-0으로 앞서던 FA컵 준결승이 후반에 무너져 3-3이 됐고, 연장 종료 직전 코번트리의 역전골이 발끝 차이 오프사이드로 취소됐다. 맨유가 승부차기로 결승에 올랐지만 경기 내용은 완패였고, 당시 감독의 거취 논쟁에 불을 붙인 90분이었다. 그보다 앞선 1963년 FA컵에서도 3부의 코번트리가 맨유를 상대로 8강까지 올라간 기록이 있다. 25년 만의 재회는 이 준결승의 뒷맛을 두 팬층 모두에게 되살릴 가능성이 높다.",
    "tottenham-hotspur":"코번트리의 유일한 메이저 트로피가 토트넘의 희생 위에 있다. 1987년 FA컵 결승에서 클라이브 앨런(Clive Allen)이 이른 시간에 앞서 나갔지만 키스 하우첸(Keith Houchen)의 다이빙 헤더로 따라잡혔고, 연장에서 개리 매벗(Gary Mabbutt)의 무릎을 맞고 들어간 공이 결승골이 됐다. 그전까지 FA컵 결승에서 한 번도 진 적이 없다는 토트넘의 오랜 자부심이 이날 끝났다. 매벗은 이후에도 구단의 상징적인 주장으로 남았지만 이 한 장면은 두 팬층 모두의 기억에서 지워지지 않았다. 25년 만에 리그에서 다시 만나는 이번 시즌, 코번트리 팬들이 부를 노래는 이미 정해져 있다."
  },
  watch:[
    "25년 만의 1부: 챔피언십을 지배한 축구가 프리미어리그 속도에서도 통하는지.",
    "램파드 감독의 첫 최상위 시즌: 승격 성공 이후 잔류 설계를 어떻게 짜는지.",
    "심스와 라이트의 득점 분담: 2부에서 통하던 공격 조합의 리그 적응 속도."
  ]
},

"crystal-palace": {
  name:"Crystal Palace", short:"Crystal Palace", ko:"크리스털 팰리스", abbr:"CRY",
  nick:"이글스", founded:1905, city:"런던",
  color:"#1B458F", color2:"#C4122E",
  stadium:{ name:"Selhurst Park", ko:"셀허스트 파크", capacity:25194, opened:1924,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/2023_09_09_arne_mueseler_17_18_07_00743-Verbessert-RR_%2853283239217%29.jpg/1280px-2023_09_09_arne_mueseler_17_18_07_00743-Verbessert-RR_%2853283239217%29.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 2.0",
      source:"https://commons.wikimedia.org/wiki/File:2023_09_09_arne_mueseler_17_18_07_00743-Verbessert-RR_(53283239217).jpg" } },
  manager:{ name:"Pierre Sage", ko:"피에르 사주", since:2026 },
  keyPlayers:[
    { name:"Dean Henderson", ko:"딘 헨더슨", pos:"GK" },
    { name:"Chadi Riad", ko:"샤디 리아드", pos:"DF" },
    { name:"Adam Wharton", ko:"애덤 와튼", pos:"MF" },
    { name:"Ismaïla Sarr", ko:"이스마일라 사르", pos:"FW" },
    { name:"Jean-Philippe Mateta", ko:"장필리프 마테타", pos:"FW" }
  ],
  intro:"남런던의 소란스러운 구단. 셀허스트 파크의 홀름스데일 엔드(Holmesdale End)는 깃발과 북, 연막이 상시로 등장하는 잉글랜드 최고 수준의 응원 구역으로 꼽힌다. 2025년 FA컵 우승으로 창단 120년 만에 첫 메이저 트로피를 들어올리며 오랜 '트로피 없는 구단' 딱지를 뗐다.",
  history:[
    { y:1990, t:"FA컵 결승의 3-3", d:"맨유와 3-3으로 비겼지만 재경기에서 0-1로 졌다. 이 결승이 퍼거슨의 첫 트로피이자 그의 경질설을 잠재운 분기점이었다." },
    { y:2013, t:"플레이오프 승격", d:"웸블리 연장 페널티킥으로 왓퍼드를 꺾고 프리미어리그 복귀. 이후 최상위 리그에 정착했다." },
    { y:2025, t:"창단 첫 메이저 트로피", d:"FA컵 결승에서 맨시티를 1-0으로 꺾고 우승. 이어 커뮤니티 실드까지 차지했다." }
  ],
  relations:{
    "manchester-united":"맨유와 팰리스는 FA컵으로 얽힌 사이다. 1990년 결승에서 3-3 접전 끝에 재경기로 갔고, 퍼거슨이 골키퍼 짐 레이턴(Jim Leighton)을 빼고 레스 실리(Les Sealey)를 세우는 냉정한 결정을 내려 1-0으로 이겼다. 이 트로피가 없었다면 퍼거슨 시대가 그 자리에서 끝났을 것이라는 평가가 지금도 따라다닌다. 2016년 결승에서 다시 만나 팰리스가 먼저 앞서갔지만 연장에서 뒤집혀 1-2로 졌다. 두 번의 결승에서 모두 팰리스가 리드를 잡고도 놓친 셈이라, 셀허스트 파크에서 맨유를 만나는 날의 분위기는 유난히 날이 서 있다.",
    "tottenham-hotspur":"남런던 원정이라 이동 거리는 짧지만 토트넘에게 편한 적은 별로 없는 경기다. 셀허스트 파크의 홀름스데일 엔드가 만드는 소음과 좁은 피치가 점유 중심의 팀에게 특히 불편하고, 실제로 토트넘이 이곳에서 승점을 잃은 시즌이 여러 번 있었다. 2025년은 두 구단이 나란히 오랜 무관을 끝낸 해이기도 하다. 팰리스는 창단 120년 만에 첫 메이저 트로피인 FA컵을 들었고, 토트넘은 41년 만에 유럽 트로피를 들었다. 같은 해 여름 이버레치 에제(Eberechi Eze)의 이적 협상이 막판에 아스널 쪽으로 넘어간 일은 토트넘 팬들에게 유난히 쓴 기억으로 남았다."
  },
  watch:[
    "사주 감독의 프리미어리그 데뷔: 리옹에서 보여준 빠른 재건 능력이 남런던에서도 통하는지.",
    "FA컵 우승 이후: 첫 트로피 뒤에 오는 유럽 일정과 리그의 병행 부담.",
    "와튼의 역할: 후방 배급을 책임지는 미드필더 한 명에 대한 의존도가 얼마나 되는지."
  ]
},

"everton": {
  name:"Everton", short:"Everton", ko:"에버턴", abbr:"EVE",
  nick:"토피스", founded:1878, city:"리버풀",
  color:"#003399", color2:"#FFFFFF",
  stadium:{ name:"Hill Dickinson Stadium", ko:"힐 디킨슨 스타디움", capacity:52769, opened:2025,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hill_Dickinson_Stadium%2C_Liverpool_Waterfront_-_geograph.org.uk_-_8170881.jpg/960px-Hill_Dickinson_Stadium%2C_Liverpool_Waterfront_-_geograph.org.uk_-_8170881.jpg",
      credit:"David Dixon", license:"CC BY-SA 2.0",
      source:"https://commons.wikimedia.org/wiki/File:Hill_Dickinson_Stadium,_Liverpool_Waterfront_-_geograph.org.uk_-_8170881.jpg" } },
  manager:{ name:"David Moyes", ko:"데이비드 모예스", since:2025 },
  keyPlayers:[
    { name:"Jordan Pickford", ko:"조던 픽포드", pos:"GK" },
    { name:"Jarrad Branthwaite", ko:"재러드 브랜스웨이트", pos:"DF" },
    { name:"James Tarkowski", ko:"제임스 타코스키", pos:"DF" },
    { name:"Kiernan Dewsbury-Hall", ko:"키어넌 듀스버리홀", pos:"MF" },
    { name:"Jack Grealish", ko:"잭 그릴리시", pos:"FW" }
  ],
  intro:"1부 리그 최다 시즌을 보낸 구단 중 하나이자 리그 우승 9회의 옛 강자. 1892년 리버풀 창단의 원인이 된 구단이기도 하다. 2025년 130여 년을 보낸 구디슨 파크(Goodison Park)를 떠나 브램리무어 독(Bramley-Moore Dock)의 새 구장으로 옮기며 구단 역사에서 가장 큰 전환점을 맞았다.",
  history:[
    { y:1892, t:"구디슨 파크로", d:"안필드(Anfield) 임대료 분쟁으로 구장을 떠났고, 남겨진 안필드에 리버풀 FC가 새로 만들어졌다. 머지사이드 더비의 기원이다." },
    { y:1985, t:"유럽 정복", d:"컵위너스컵 우승과 리그 우승을 동시에 달성. 하지만 헤이젤 참사로 잉글랜드 구단이 유럽 대회에서 제외되며 전성기가 끊겼다." },
    { y:1987, t:"마지막 리그 우승", d:"통산 아홉 번째 1부 타이틀. 이후 리그 정상에 다시 오르지 못했다." },
    { y:2023, t:"승점 삭감", d:"재정 규정 위반으로 프리미어리그에서 승점을 삭감당하며 두 시즌 연속 강등권 싸움을 벌였다." },
    { y:2025, t:"힐 디킨슨 스타디움 개장", d:"구디슨 파크를 떠나 부두 부지에 지은 5만 2천 석 새 구장으로 이전했다." }
  ],
  relations:{
    "manchester-united":"에버턴은 맨유의 컵 대회 역사에 여러 번 등장한다. 1985년 FA컵 결승에서는 케빈 모런(Kevin Moran)이 결승전 사상 첫 퇴장을 당한 열 명의 맨유가 연장 골로 1-0 승리를 거두며 에버턴의 트레블을 막았다. 10년 뒤인 1995년 결승에서는 에버턴이 1-0으로 되갚았고, 이 패배가 퍼거슨이 스쿼드를 유스 중심으로 갈아엎는 계기 중 하나가 됐다. 2009년 FA컵 준결승 승부차기 승리도 에버턴의 몫이었다. 리그에서는 구디슨 파크가 맨유에게 오랫동안 까다로운 원정지였고, 그 부담이 새 구장으로 그대로 옮겨갈지가 관심사다.",
    "tottenham-hotspur":"에버턴과 토트넘은 라이벌이라기보다 서로의 역사에 자주 등장하는 사이다. 1995년 FA컵 준결승에서 에버턴이 토트넘을 꺾고 결승에 올라 그해 우승까지 갔고, 토트넘 팬에게는 컵 도전이 끝난 날로 남아 있다. 두 구단을 모두 거친 대표적인 선수는 개리 리네커(Gary Lineker)다. 구디슨 파크에서 한 시즌 만에 리그 득점왕에 오른 뒤 바르셀로나를 거쳐 토트넘에서 FA컵을 들었다. 최근에는 히샬리송(Richarlison)이 구디슨을 떠나 북런던으로 오고 델리 알리(Dele Alli)가 반대 방향으로 움직이며 선수 이동이 잦아졌는데, 구디슨 파크 특유의 까다로움이 힐 디킨슨 스타디움으로 옮겨갔는지가 이제 관전 포인트다."
  },
  watch:[
    "새 구장 2년 차: 5만 2천 석 홈의 분위기가 구디슨 파크 수준으로 자리 잡는지.",
    "모예스의 두 번째 임기: 2002년부터 11년을 이끌었던 감독이 만드는 팀 구조.",
    "브랜스웨이트와 수비 라인: 실점 억제로 버티던 팀이 득점력을 얼마나 끌어올리는지."
  ]
},

"fulham": {
  name:"Fulham", short:"Fulham", ko:"풀럼", abbr:"FUL",
  nick:"코티저스", founded:1879, city:"런던",
  color:"#000000", color2:"#CC0000",
  stadium:{ name:"Craven Cottage", ko:"크레이븐 코티지", capacity:28107, opened:1896,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Craven_Cottage_stadium_view.jpg/1280px-Craven_Cottage_stadium_view.jpg",
      credit:"EL Loko", license:"CC BY 4.0",
      source:"https://commons.wikimedia.org/wiki/File:Craven_Cottage_stadium_view.jpg" } },
  manager:{ name:"Álvaro Arbeloa", ko:"알바로 아르벨로아", since:2026 },
  keyPlayers:[
    { name:"Bernd Leno", ko:"베른트 레노", pos:"GK" },
    { name:"Antonee Robinson", ko:"안토니 로빈슨", pos:"DF" },
    { name:"Alex Iwobi", ko:"알렉스 이워비", pos:"MF" },
    { name:"Oscar Bobb", ko:"오스카르 보브", pos:"FW" },
    { name:"Rodrigo Muniz", ko:"호드리구 무니스", pos:"FW" }
  ],
  intro:"템스강변에 붙어 있는 런던에서 가장 오래된 프로 구단. 크레이븐 코티지는 강가에 자리한 데다 1905년에 지어진 목조 파빌리온이 그대로 남아 있어 프리미어리그에서 가장 이질적인 경기장으로 꼽힌다. 최근에는 리버사이드 스탠드를 새로 지으며 규모를 키웠다.",
  history:[
    { y:1896, t:"크레이븐 코티지 개장", d:"템스강변 부지에 자리 잡은 뒤 130년 가까이 같은 자리를 지키고 있다. 잉글랜드에서 손꼽히게 오래된 홈 구장이다." },
    { y:2001, t:"1부 승격", d:"모하메드 알 파예드(Mohamed Al Fayed) 구단주 아래 33년 만에 최상위 리그로 복귀했다." },
    { y:2010, t:"유로파리그 준우승", d:"유벤투스와 함부르크를 차례로 꺾고 결승에 올라 아틀레티코 마드리드에 연장 끝에 1-2로 졌다. 구단 역사상 최고 성적이다." },
    { y:2022, t:"승강 반복의 종료", d:"세 시즌 만의 승격 이후 프리미어리그에 안정적으로 정착하며 오르내림의 시기를 끝냈다." }
  ],
  relations:{
    "manchester-united":"풀럼은 맨유에게 전통적 라이벌이라기보다 결과가 잘 안 풀리면 체면이 상하는 상대에 가깝다. 크레이븐 코티지는 좁고 관중석이 가까워 원정팀이 리듬을 잃기 쉬운 곳이고, 실제로 맨유가 이곳에서 승점을 흘린 시즌이 여러 번 있었다. 가장 요란했던 만남은 2023년 FA컵 8강이다. 후반에 풀럼 선수가 골라인에서 손으로 공을 막아 퇴장당하고, 항의하던 알렉산다르 미트로비치(Aleksandar Mitrović)가 주심을 밀어 함께 퇴장당하고, 감독까지 쫓겨나는 몇 분 사이에 경기가 무너졌다. 최근 리그 맞대결은 대체로 접전이고, 풀럼이 강팀 상대로 잘 버티는 팀이라는 인식이 자리 잡았다.",
    "tottenham-hotspur":"강 건너 짧은 원정이지만 크레이븐 코티지는 토트넘에게 결과가 잘 안 나오는 곳으로 종종 꼽힌다. 관중석이 피치에 붙어 있고 규모가 작아, 상대가 밀집 수비로 버티면 점유율만 쌓다가 끝나는 전형적인 경기가 나온다. 두 구단을 잇는 결정적인 시점은 2012년 여름이다. 무사 뎀벨레(Mousa Dembélé)와 클린트 뎀프시(Clint Dempsey)가 같은 이적시장에 크레이븐 코티지를 떠나 토트넘에 합류했고, 특히 뎀벨레는 이후 6년 넘게 중원의 축이 됐다. 라이벌리라기보다 런던 안에서 선수와 코치가 오가는 이웃 관계에 가깝다."
  },
  watch:[
    "아르벨로아의 부임: 레알 마드리드 유스 라인에서 온 감독이 프리미어리그에 어떻게 적응하는지.",
    "마르코 실바(Marco Silva) 이후의 스타일: 안정적인 4-2-3-1 구조가 유지되는지 바뀌는지.",
    "보브의 합류: 부상으로 잃은 시간이 많았던 윙어가 정기 출전 기회를 어떻게 쓰는지."
  ]
},

"hull-city": {
  name:"Hull City", short:"Hull City", ko:"헐 시티", abbr:"HUL",
  nick:"타이거스", founded:1904, city:"킹스턴어폰헐",
  color:"#F5A12D", color2:"#000000",
  stadium:{ name:"MKM Stadium", ko:"MKM 스타디움", capacity:24983, opened:2002,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/MKM_Stadium_North_Stand_View.jpg/1280px-MKM_Stadium_North_Stand_View.jpg",
      credit:"NONONSENSEDEFENDING", license:"CC BY-SA 4.0",
      source:"https://commons.wikimedia.org/wiki/File:MKM_Stadium_North_Stand_View.jpg" } },
  manager:{ name:"Sergej Jakirović", ko:"세르게이 야키로비치", since:2025 },
  keyPlayers:[
    { name:"Jack Butland", ko:"잭 버틀런드", pos:"GK" },
    { name:"Charlie Hughes", ko:"찰리 휴스", pos:"DF" },
    { name:"Hidemasa Morita", ko:"모리타 히데마사", pos:"MF" },
    { name:"Joe Gelhardt", ko:"조 겔하트", pos:"MF" },
    { name:"Oli McBurnie", ko:"올리 맥버니", pos:"FW" }
  ],
  intro:"잉글랜드 동해안 항구도시의 구단. 창단 104년 만인 2008년에야 처음 최상위 리그를 밟았고, 이후 승격과 강등을 반복해왔다. 터키 방송인 아준 을르잘르(Acun Ilıcalı) 체제에서 국제적인 영입을 늘리며 2026년 플레이오프로 다시 프리미어리그에 올라왔다.",
  history:[
    { y:2008, t:"104년 만의 1부", d:"웸블리 플레이오프 결승에서 브리스틀 시티를 1-0으로 꺾고 창단 후 처음으로 최상위 리그에 진입했다." },
    { y:2014, t:"FA컵 준우승", d:"결승에서 아스널을 상대로 8분 만에 2-0으로 앞섰지만 연장 끝에 2-3으로 역전패했다. 구단 최고의 컵 성적이다." },
    { y:2015, t:"이름을 지키다", d:"구단주가 'Hull Tigers'로 개명을 추진했으나 축구협회가 거부했고, 팬들의 반대 운동이 이를 막아냈다." },
    { y:2026, t:"플레이오프 승격", d:"정규 시즌 6위로 플레이오프에 올라 밀월과 미들즈브러를 연이어 꺾고 승격을 확정했다. 결승은 1-0 승리." }
  ],
  relations:{
    "manchester-united":"맨유와 헐 시티는 규모 차이가 큰 만큼 대등한 라이벌 관계는 아니지만, 짧은 프리미어리그 시절마다 기억할 장면을 남겼다. 2017년 리그컵 준결승에서 맨유가 1차전을 잡은 뒤 KCOM 스타디움에서 열린 2차전에서 0-2로 지고도 합계로 결승에 올랐다. 강등이 걸린 시즌 최종전에서 맨유를 만나 승점을 지키려 애쓰던 경기들도 헐 팬에게는 선명하다. 이번 승격으로 두 팀은 여러 해 만에 다시 리그에서 만나고, 맨유 원정은 헐 시티 팬들이 시즌 일정표에서 가장 먼저 찾아보는 경기다.",
    "tottenham-hotspur":"헐 시티가 창단 104년 만에 처음 1부에 올라온 2008-09 시즌 초반, 승격팀이 런던 원정에서 아스널과 토트넘을 잇달아 잡아내며 리그를 놀라게 한 일이 두 구단의 가장 선명한 접점이다. 그 뒤로는 대등한 맞대결보다 선수 이동으로 엮였다. 톰 허들스톤(Tom Huddlestone)과 제이크 리버모어(Jake Livermore)가 화이트 하트 레인을 떠나 험버사이드로 갔고, 토트넘 주장을 지낸 마이클 도슨(Michael Dawson)도 헐에서 주장 완장을 찼다. 오랜 기간 서로 다른 리그에 있었던 탓에 최근 세대의 팬들에게는 낯선 대진이고, MKM 스타디움 원정은 이번 승격으로 여러 해 만에 다시 일정표에 올랐다."
  },
  watch:[
    "승격 스쿼드의 프리미어리그 검증: 챔피언십에서 통한 조합이 상위 리그 속도에 버티는지.",
    "야키로비치 체제의 지속성: 감독 교체가 잦았던 구단이 안정을 유지할 수 있는지.",
    "모리타와 중원 구성: 유럽 상위 리그 경험자를 얼마나 활용하는지."
  ]
},

"ipswich-town": {
  name:"Ipswich Town", short:"Ipswich", ko:"입스위치 타운", abbr:"IPS",
  nick:"트랙터 보이스", founded:1878, city:"입스위치",
  color:"#0E00F7", color2:"#DE2C37",
  stadium:{ name:"Portman Road", ko:"포트먼 로드", capacity:30056, opened:1884,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Portman_Road_aerial_%28cropped%29.jpg/1280px-Portman_Road_aerial_%28cropped%29.jpg",
      credit:"John Fielding", license:"CC BY 2.0",
      source:"https://commons.wikimedia.org/wiki/File:Portman_Road_aerial_(cropped).jpg" } },
  manager:{ name:"Gary O'Neil", ko:"게리 오닐", since:2026 },
  keyPlayers:[
    { name:"Alex Palmer", ko:"알렉스 파머", pos:"GK" },
    { name:"Leif Davis", ko:"레이프 데이비스", pos:"DF" },
    { name:"Florentino Luís", ko:"플로렌티누 루이스", pos:"MF" },
    { name:"Jaden Philogene", ko:"제이든 필로진", pos:"FW" },
    { name:"Daizen Maeda", ko:"마에다 다이젠", pos:"FW" }
  ],
  intro:"이스트앵글리아의 조용한 도시 구단이지만 트로피 이력은 만만치 않다. 알프 램지(Alf Ramsey)와 보비 롭슨(Bobby Robson), 두 잉글랜드 대표팀 감독을 배출했고 리그 우승과 UEFA컵 우승 경험이 있다. 포트먼 로드는 1884년부터 같은 자리를 지켜온 구장이다.",
  history:[
    { y:1962, t:"승격 직후 리그 우승", d:"알프 램지가 1부 승격 첫 시즌에 곧바로 리그 정상에 올랐다. 그는 4년 뒤 잉글랜드를 월드컵 우승으로 이끈다." },
    { y:1978, t:"FA컵 우승", d:"보비 롭슨 아래 아스널을 1-0으로 꺾고 웸블리에서 우승했다." },
    { y:1981, t:"UEFA컵 우승", d:"AZ 알크마르를 합계 5-4로 꺾고 유럽 대회 정상에. 같은 시즌 리그 준우승으로 구단 최전성기를 찍었다." },
    { y:2024, t:"두 시즌 연속 승격", d:"3부에서 프리미어리그까지 두 해 만에 올라 22년 만의 최상위 복귀를 이뤘다." },
    { y:2026, t:"다시 승격", d:"2025년 강등 후 한 시즌 만에 챔피언십 2위로 자동 승격했다." }
  ],
  relations:{
    "manchester-united":"입스위치는 맨유가 상대하기 껄끄러웠던 시절이 분명히 있는 팀이다. 보비 롭슨 시대의 입스위치는 1980년 3월 포트먼 로드에서 맨유를 6-0으로 꺾었는데, 이는 맨유가 1부에서 당한 최다 점수 차 패배 중 하나로 남아 있다. 반대로 1995년 3월 올드 트래퍼드에서는 맨유가 9-0으로 이겨 프리미어리그 최다 점수 차 승리 기록을 세웠고, 앤디 콜(Andy Cole)이 한 경기 5골을 넣었다. 같은 두 구단 사이에서 극단적인 두 스코어가 모두 나온 셈이라, 맞대결마다 이 두 숫자가 함께 소환된다.",
    "tottenham-hotspur":"1961-62 시즌이 두 구단을 묶는다. 직전 시즌 20세기 첫 더블을 달성한 토트넘이 타이틀 방어에 나섰지만, 알프 램지(Alf Ramsey)가 만든 승격팀 입스위치가 그 자리를 가져갔다. 램지의 변칙적인 윙어 배치를 빌 니컬슨(Bill Nicholson)이 뒤늦게 파악했다는 이야기가 지금도 전술사에서 인용되고, 그 답을 들고 나선 이듬해 채리티 실드에서는 토트넘이 크게 되갚았다. 이후 입스위치가 2부 이하에 머문 기간이 길어 리그에서 마주칠 일 자체가 드물었다. 1884년부터 자리를 지킨 포트먼 로드는 토트넘 팬에게 자주 가지 않는 만큼 특별하게 느껴지는 원정지다."
  },
  watch:[
    "오닐 감독의 설계: 프리미어리그 잔류 경험이 있는 감독이 승격팀을 어떻게 조직하는지.",
    "두 번째 도전: 2024-25 강등에서 얻은 교훈이 스쿼드 구성에 반영됐는지.",
    "마에다와 필로진의 속도: 역습 중심 공격이 상위권 수비를 상대로도 작동하는지."
  ]
},

"leeds-united": {
  name:"Leeds United", short:"Leeds", ko:"리즈 유나이티드", abbr:"LEE",
  nick:"화이츠", founded:1919, city:"리즈",
  color:"#1D428A", color2:"#FFCD00",
  stadium:{ name:"Elland Road", ko:"엘런드 로드", capacity:37633, opened:1897,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Leeds_United_-_31559864360.jpg/1280px-Leeds_United_-_31559864360.jpg",
      credit:"chillilogic.com", license:"CC BY 2.0",
      source:"https://commons.wikimedia.org/wiki/File:Leeds_United_-_31559864360.jpg" } },
  manager:{ name:"Daniel Farke", ko:"다니엘 파르케", since:2023 },
  keyPlayers:[
    { name:"James Trafford", ko:"제임스 트래퍼드", pos:"GK" },
    { name:"Joe Rodon", ko:"조 로던", pos:"DF" },
    { name:"Ethan Ampadu", ko:"이선 암파두", pos:"MF" },
    { name:"Ao Tanaka", ko:"다나카 아오", pos:"MF" },
    { name:"Dominic Calvert-Lewin", ko:"도미닉 캘버트르윈", pos:"FW" }
  ],
  intro:"요크셔의 자존심이자 잉글랜드에서 가장 격렬한 팬층을 가진 구단 중 하나. 돈 레비(Don Revie) 시대의 리그 우승과 2001년 챔피언스리그 4강 이후 재정 붕괴로 3부까지 떨어졌던 극단적인 부침의 역사를 갖고 있다. 엘런드 로드는 소음과 적대감으로 원정팀에게 악명 높은 경기장이다.",
  history:[
    { y:1969, t:"레비 시대의 첫 우승", d:"돈 레비가 만든 팀이 리그 정상에 올랐다. 이 시기 리즈는 잉글랜드에서 가장 강하고 가장 미움받는 팀이었다." },
    { y:1992, t:"마지막 리그 우승", d:"프리미어리그 출범 직전 마지막 1부 시즌에 우승. 그해 겨울 에릭 칸토나(Eric Cantona)가 팀에 합류했다." },
    { y:2001, t:"챔피언스리그 4강", d:"발렌시아에 막혀 결승 문턱에서 멈췄다. 이 성적을 전제로 한 대출이 이후 재정 붕괴의 원인이 됐다." },
    { y:2004, t:"붕괴", d:"강등 이후 선수를 헐값에 처분했고 2007년에는 3부까지 떨어졌다." },
    { y:2020, t:"16년 만의 복귀", d:"마르셀로 비엘사(Marcelo Bielsa) 아래 챔피언십 우승으로 프리미어리그로 돌아왔다." }
  ],
  relations:{
    "manchester-united":"맨유와 리즈의 관계는 축구를 넘어선다. 랭커셔와 요크셔의 장미 전쟁(Wars of the Roses)에서 이름을 따온 '로지즈 더비'로, 잉글랜드에서 가장 적대적인 대립 중 하나로 꼽힌다. 결정적 사건은 1992년 11월 에릭 칸토나의 이적이었다. 리즈에 리그 우승을 안긴 프랑스인이 곧바로 올드 트래퍼드로 넘어가 맨유의 왕조를 열었고, 리즈 팬들은 이 이적을 배신으로 기억한다. 두 구단이 오랜 기간 다른 리그에 있었던 탓에 맞대결 자체가 귀했지만, 만날 때마다 경기장 안팎의 긴장 수위는 시즌 어느 경기보다 높다.",
    "tottenham-hotspur":"엘런드 로드는 어느 원정팀에게나 시끄러운 곳이고 토트넘도 예외가 아니지만, 두 구단 사이에 지역적 대립은 없다. 대신 선수 이동으로 이어진 접점이 크다. 로비 킨(Robbie Keane)이 2002년 리즈의 재정 붕괴 와중에 화이트 하트 레인으로 옮겨와 구단 역사에 남는 공격수가 됐고, 반대로 조 로던(Joe Rodon)은 토트넘에서 자리를 잡지 못한 뒤 엘런드 로드에서 수비의 중심이 됐다. 리즈가 오랫동안 하위 리그에 있었던 탓에 맞대결 자체가 귀했고, 승격한 시즌마다 이 경기는 양쪽 팬 모두에게 오랜만의 재회로 다뤄진다."
  },
  watch:[
    "파르케의 네 번째 시즌: 승격을 이끈 감독이 최상위 리그에서 팀을 어떻게 다듬는지.",
    "엘런드 로드의 홈 이점: 관중 소음이 실제 결과로 이어지는 경기가 얼마나 되는지.",
    "캘버트르윈의 최전방: 부상 이력이 있는 스트라이커에게 얼마나 의존하는지."
  ]
},

"liverpool": {
  name:"Liverpool", short:"Liverpool", ko:"리버풀", abbr:"LIV",
  nick:"레즈", founded:1892, city:"리버풀",
  color:"#C8102E", color2:"#00B2A9",
  stadium:{ name:"Anfield", ko:"안필드", capacity:61276, opened:1884,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Panorama_of_Anfield_with_new_main_stand_%2829676137824%29.jpg/1280px-Panorama_of_Anfield_with_new_main_stand_%2829676137824%29.jpg",
      credit:"Ruaraidh Gillies", license:"CC BY-SA 2.0",
      source:"https://commons.wikimedia.org/wiki/File:Panorama_of_Anfield_with_new_main_stand_(29676137824).jpg" } },
  manager:{ name:"Andoni Iraola", ko:"안도니 이라올라", since:2026 },
  keyPlayers:[
    { name:"Alisson Becker", ko:"알리송 베케르", pos:"GK" },
    { name:"Virgil van Dijk", ko:"버질 반 다이크", pos:"DF" },
    { name:"Florian Wirtz", ko:"플로리안 비르츠", pos:"MF" },
    { name:"Dominik Szoboszlai", ko:"도미니크 소보슬러이", pos:"MF" },
    { name:"Alexander Isak", ko:"알렉산더르 이사크", pos:"FW" }
  ],
  intro:"잉글랜드에서 가장 많은 트로피를 모은 구단이자 유러피언컵 6회 우승팀. 빌 섕클리(Bill Shankly)와 밥 페이즐리(Bob Paisley)의 부트룸 문화에서 시작된 승리의 관성이 지금도 구단 정체성의 뼈대다. 안필드의 콥(Kop) 관중석과 경기 전 'You'll Never Walk Alone' 합창은 잉글랜드 축구의 상징 중 하나다.",
  history:[
    { y:1892, t:"분쟁에서 태어나다", d:"에버턴이 임대료 문제로 안필드를 떠나자 구장 소유주가 새 구단을 만들었다. 리버풀 FC의 시작이다." },
    { y:1977, t:"첫 유러피언컵", d:"로마에서 묀헨글라트바흐를 3-1로 꺾고 유럽 정상에. 이후 1978, 1981, 1984년까지 네 번을 더 들었다." },
    { y:1989, t:"힐스버러", d:"FA컵 준결승에서 관중 압사 사고로 97명이 사망했다. 잉글랜드 축구장 전면 좌석화로 이어진 참사이며, 오랜 법정 싸움 끝에 진상이 규명됐다." },
    { y:2005, t:"이스탄불의 밤", d:"AC 밀란에 0-3으로 뒤진 하프타임 이후 6분 만에 3-3을 만들고 승부차기로 다섯 번째 빅이어를 들었다." },
    { y:2020, t:"30년 만의 리그", d:"위르겐 클롭(Jürgen Klopp) 아래 프리미어리그 첫 우승. 1990년 이후 30년의 기다림이 끝났다." }
  ],
  relations:{
    "manchester-united":"잉글랜드 축구 최대의 라이벌. 산업혁명기 리버풀 항과 맨체스터 운하를 둘러싼 두 도시의 경제적 경쟁에서 시작해 축구로 옮겨왔다. 리버풀이 1970~80년대에 유럽을 지배했고, 퍼거슨이 부임하며 내건 목표가 '리버풀을 그 빌어먹을 자리에서 끌어내리는 것'이었다는 발언은 이 대립의 성격을 그대로 요약한다. 리그 우승 횟수를 두고 두 구단이 서로를 추월해온 역사이기도 하다. 최근에는 안필드와 올드 트래퍼드 어느 쪽에서도 큰 점수 차 경기가 나오며, 승점보다 자존심이 먼저 걸린 경기라는 성격이 더 짙어졌다.",
    "tottenham-hotspur":"토트넘 팬에게 리버풀전은 큰 무대에서 번번이 막힌 기억과 겹친다. 2019년 마드리드 챔피언스리그 결승에서 시작 2분 만에 페널티킥으로 실점한 뒤 끝내 따라잡지 못하고 0-2로 졌고, 구단 역사상 첫 유럽 최고 무대 결승이 그렇게 끝났다. 안필드 리그 원정도 1980년대 중반부터 20년 넘게 이기지 못한 긴 공백이 있었다. 2023년 9월 안필드에서는 루이스 디아스(Luis Díaz)의 골이 오심으로 취소되고 심판진 교신 녹음까지 공개되는 초유의 일이 벌어졌는데, 정작 그 경기는 토트넘이 이겨 논쟁의 방향이 반대로 흘렀다. 지역적 앙금이 걸린 대진은 아니지만 결과가 시즌의 성격을 규정하는 일이 잦다."
  },
  watch:[
    "이라올라의 첫 시즌: 본머스에서 검증된 강한 전방 압박을 훨씬 두꺼운 스쿼드로 구현할 수 있는지.",
    "비르츠와 이사크의 결합: 대형 영입 두 명이 서로의 공간을 어떻게 나누는지.",
    "클롭 이후의 정체성: 감독이 두 번 바뀐 뒤에도 안필드의 경기 방식이 이어지는지."
  ]
},

"manchester-city": {
  name:"Manchester City", short:"Man City", ko:"맨체스터 시티", abbr:"MCI",
  nick:"시티즌스", founded:1880, city:"맨체스터",
  color:"#6CABDD", color2:"#1C2C5B",
  stadium:{ name:"Etihad Stadium", ko:"에티하드 스타디움", capacity:61038, opened:2002,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/City_of_Manchester_Stadium_2023_cropped.jpg/1280px-City_of_Manchester_Stadium_2023_cropped.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:City_of_Manchester_Stadium_2023_cropped.jpg" } },
  manager:{ name:"Enzo Maresca", ko:"엔초 마레스카", since:2026 },
  keyPlayers:[
    { name:"Gianluigi Donnarumma", ko:"잔루이지 돈나룸마", pos:"GK" },
    { name:"Rúben Dias", ko:"후벵 디아스", pos:"DF" },
    { name:"Phil Foden", ko:"필 포든", pos:"MF" },
    { name:"Rayan Cherki", ko:"라얀 셰르키", pos:"MF" },
    { name:"Erling Haaland", ko:"엘링 홀란", pos:"FW" }
  ],
  intro:"2008년 아부다비 자본 인수 이후 잉글랜드 축구의 지형을 바꾼 구단. 펩 과르디올라(Pep Guardiola) 체제에서 점유 기반 축구를 극단까지 밀어붙여 리그를 여러 차례 지배했고 2023년 트레블을 완성했다. 에티하드 스타디움은 2002년 코먼웰스 게임 주경기장으로 지어졌다가 축구장으로 개조됐다.",
  history:[
    { y:1999, t:"3부에서의 반등", d:"플레이오프 결승에서 종료 직전 두 골을 넣어 승격. 구단이 가장 낮은 곳에서 반등한 순간으로 기억된다." },
    { y:2008, t:"아부다비 인수", d:"만수르(Mansour bin Zayed)의 인수로 이적 시장의 규모가 달라졌고, 구단의 운영 방식이 완전히 재편됐다." },
    { y:2012, t:"93분 20초", d:"리그 최종전 추가시간에 세르히오 아궤로(Sergio Agüero)가 골을 넣어 44년 만에 리그 우승. 맨유와 승점이 같아 골 득실로 갈렸다." },
    { y:2016, t:"과르디올라 부임", d:"이후 여덟 시즌에 걸쳐 프리미어리그 우승을 반복하며 지배기를 열었다." },
    { y:2023, t:"트레블", d:"리그·FA컵·챔피언스리그를 한 시즌에 모두 차지했다. 잉글랜드 구단으로는 1999년 맨유 이후 두 번째다." }
  ],
  relations:{
    "manchester-united":"맨체스터 더비. 오랫동안 맨유가 압도적인 우위를 점했고, 시티 팬들은 강등과 3부 시절을 견디며 '진짜 맨체스터'라는 자기 정의를 만들었다. 판도가 뒤집힌 시점은 2011년 10월 올드 트래퍼드에서의 1-6이다. 마리오 발로텔리(Mario Balotelli)가 유니폼 안에서 꺼낸 'Why Always Me?' 문구가 그날의 상징이 됐고, 이 6골 차가 그 시즌 골 득실 우승의 근거가 됐다. 2023년 FA컵 결승에서 시티가 2-1로 이기며 맨유의 1999년 트레블까지 따라잡은 것도 이 대립의 무게를 키웠다. 지금 더비는 도시의 자존심과 최근 20년의 서열이 동시에 걸린 경기다.",
    "tottenham-hotspur":"맨시티전은 토트넘에게 극단적인 결과가 유독 많이 나온 경기다. 2004년 FA컵 재경기에서는 전반에 3-0으로 앞서고 상대가 열 명이 된 상황에서 후반에만 네 골을 내주며 3-4로 졌다. 반대로 2010년 화이트 하트 레인에서는 피터 크라우치(Peter Crouch)의 한 골로 맨시티를 제치고 챔피언스리그 진출권을 따냈다. 2019년 챔피언스리그 8강 에티하드 2차전에서는 3-4로 지고도 원정 다득점으로 4강에 올랐는데, 추가시간 라힘 스털링(Raheem Sterling)의 골이 VAR로 취소되는 장면이 이 대진의 상징이 됐다. 카일 워커(Kyle Walker)처럼 선수도 오갔고, 자원 차이가 큰 만큼 토트넘이 이기면 시즌 내내 회자되는 경기다."
  },
  watch:[
    "마레스카의 첫 시즌: 과르디올라 아래 코치로 있었던 감독이 그의 구조를 어떻게 이어받고 바꾸는지.",
    "홀란 의존도: 득점의 상당 부분이 한 선수에게 집중된 구조의 대안이 있는지.",
    "세대 교체: 지배기를 만든 핵심들이 빠진 자리를 새 영입이 메우는지."
  ]
},

"manchester-united": {
  name:"Manchester United", short:"Man Utd", ko:"맨체스터 유나이티드", abbr:"MUN",
  nick:"레드 데블스", founded:1878, city:"맨체스터",
  color:"#DA291C", color2:"#FBE122",
  stadium:{ name:"Old Trafford", ko:"올드 트래퍼드", capacity:74158, opened:1910,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg/1280px-2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 2.0",
      source:"https://commons.wikimedia.org/wiki/File:2023_07_31_arne_mueseler_00060-Verbessert-RR_(53106651455).jpg" } },
  manager:{ name:"Michael Carrick", ko:"마이클 캐릭", since:2026 },
  keyPlayers:[
    { name:"Senne Lammens", ko:"세너 라먼스", pos:"GK" },
    { name:"Matthijs de Ligt", ko:"마테이스 더 리흐트", pos:"DF" },
    { name:"Bruno Fernandes", ko:"브루누 페르난드스", pos:"MF" },
    { name:"Bryan Mbeumo", ko:"브라이언 음뵈모", pos:"FW" },
    { name:"Benjamin Šeško", ko:"베냐민 셰슈코", pos:"FW" }
  ],
  intro:"1878년 철도 노동자들이 뉴턴 히스(Newton Heath)라는 이름으로 만든 구단. 뮌헨 참사에서 팀의 절반을 잃고 10년 만에 유러피언컵을 든 회복의 서사, 그리고 퍼거슨의 26년이 정체성의 두 축이다. 리그 우승 20회로 잉글랜드 최다이며, 올드 트래퍼드는 잉글랜드 구단 경기장 중 가장 크다.",
  history:[
    { y:1958, t:"뮌헨 참사", d:"뮌헨 공항 활주로에서 이륙에 실패한 항공기 사고로 선수 여덟 명을 포함해 23명이 사망했다. 맷 버스비(Matt Busby)가 만든 '버스비 베이브스'가 이 사고로 흩어졌다." },
    { y:1968, t:"첫 유러피언컵", d:"참사 10년 뒤 웸블리에서 벤피카를 4-1로 꺾고 잉글랜드 구단 최초로 유럽 정상에 올랐다. 보비 찰턴(Bobby Charlton)은 뮌헨 생존자였다." },
    { y:1993, t:"26년 만의 리그", d:"프리미어리그 원년 우승. 이후 퍼거슨 아래 20년 동안 리그 타이틀 열세 개를 더 쌓는다." },
    { y:1999, t:"트레블", d:"바르셀로나 캄 노우에서 열린 챔피언스리그 결승 추가시간에 두 골을 넣어 뒤집으며 리그·FA컵·챔피언스리그를 모두 차지했다." },
    { y:2013, t:"퍼거슨 은퇴", d:"20번째 리그 우승과 함께 물러났다. 이후 구단은 감독 교체와 재건을 반복하며 리그 정상에 돌아오지 못하고 있다." }
  ],
  relations:{
    "tottenham-hotspur":"토트넘 팬에게 맨유전은 오랫동안 '거의 다 잡았다가 놓친 경기'의 목록이었다. 2001년 화이트 하트 레인에서 전반을 3-0으로 앞서고도 후반에만 다섯 골을 내주며 3-5로 진 경기, 2005년 올드 트래퍼드에서 페드루 멘데스(Pedro Mendes)의 슛이 골라인을 한참 넘어갔는데도 인정되지 않아 골라인 판독 도입 논의를 앞당긴 이른바 '유령골'이 대표적이다. 리그 원정에서는 1980년대 말 이후 20년 넘게 올드 트래퍼드에서 이기지 못한 공백도 있었다. 선수는 대체로 한 방향으로 흘러서, 테디 셰링엄(Teddy Sheringham), 디미타르 베르바토프(Dimitar Berbatov), 그리고 지금 맨유를 이끄는 마이클 캐릭(Michael Carrick)까지 모두 토트넘을 떠나 올드 트래퍼드에서 트로피를 들었다. 그 오랜 서열이 뒤집힌 날이 2025년 5월 빌바오였고, 유로파리그 결승 승리로 토트넘은 41년 만의 유럽 트로피와 함께 이 대진의 감정선을 바꿔놓았다."
  },
  seasonNote:"맨유의 정체성은 두 가지 신념 위에 서 있다. 유스에서 키운 선수가 1군의 중심이어야 한다는 것, 그리고 지고 있어도 마지막 순간까지 공격한다는 것. 뮌헨 이후의 재건도, 1999년 캄 노우의 추가시간 두 골도 그 신념의 결과로 이야기된다. 하지만 2013년 이후로는 감독이 여러 번 바뀌고 방향이 매번 재설정되면서, 팬들이 견뎌온 것은 성적보다 일관성의 부재였다. 2026-27 시즌은 유스 시절부터 이 구단에서만 성장해 1군 코치와 임시 감독을 거친 마이클 캐릭이 정식 감독으로 맞는 첫 시즌이다. 클럽 내부 출신 감독이 그 신념을 다시 팀의 경기 방식으로 번역해낼 수 있는지가 이 시즌의 질문이다.",
  watch:[
    "캐릭 체제의 첫 시즌: 내부 승격 감독이 스쿼드에 분명한 경기 원칙을 세울 수 있는지.",
    "공격진의 재구성: 음뵈모와 셰슈코를 축으로 한 전방이 득점 문제를 해결하는지.",
    "올드 트래퍼드의 미래: 구장 재개발 논의가 시즌 내내 배경 소음으로 남는다."
  ]
},

"newcastle-united": {
  name:"Newcastle United", short:"Newcastle", ko:"뉴캐슬 유나이티드", abbr:"NEW",
  nick:"맥파이스", founded:1892, city:"뉴캐슬어폰타인",
  color:"#241F20", color2:"#FFFFFF",
  stadium:{ name:"St James' Park", ko:"세인트 제임스 파크", capacity:52719, opened:1892,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Newcastle_st-james-park_stadium.jpg/1280px-Newcastle_st-james-park_stadium.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:Newcastle_st-james-park_stadium.jpg" } },
  manager:{ name:"Matthias Jaissle", ko:"마티아스 야이슬레", since:2026 },
  keyPlayers:[
    { name:"Nick Pope", ko:"닉 포프", pos:"GK" },
    { name:"Sven Botman", ko:"스벤 보트만", pos:"DF" },
    { name:"Joelinton", ko:"조엘린통", pos:"MF" },
    { name:"Anthony Elanga", ko:"앤서니 엘랑가", pos:"FW" },
    { name:"Nick Woltemade", ko:"닉 볼테마데", pos:"FW" }
  ],
  intro:"잉글랜드 북동부의 상징적 구단. 도시 한복판에 자리한 세인트 제임스 파크와 지역 정체성에 밀착한 팬층이 이 구단의 자산이다. 2021년 사우디 국부펀드가 주도한 컨소시엄 인수 이후 전력이 급격히 강화됐고, 2025년 리그컵 우승으로 70년 만에 국내 대회 트로피를 들었다.",
  history:[
    { y:1955, t:"FA컵 3연패의 마지막", d:"1950년대에만 FA컵을 세 번 들었다. 이 우승이 이후 70년간 이어질 무관 시대의 시작점이 됐다." },
    { y:1996, t:"12점 리드의 붕괴", d:"케빈 키건(Kevin Keegan)의 뉴캐슬이 리그 선두를 크게 벌리고도 맨유에 역전당했다. 시즌 막판 키건의 생중계 인터뷰가 프리미어리그 최고의 명장면 중 하나로 남았다." },
    { y:2021, t:"구단 매각", d:"사우디 국부펀드 중심 컨소시엄이 인수하며 유럽에서 가장 자금력이 큰 구단 중 하나가 됐다." },
    { y:2025, t:"70년 만의 트로피", d:"리그컵 결승에서 리버풀을 2-1로 꺾고 국내 대회 우승. 세인트 제임스 파크 앞이 사흘간 축제였다." }
  ],
  relations:{
    "manchester-united":"1995-96 시즌이 모든 것을 규정한다. 뉴캐슬이 리그 선두를 12점 차로 벌리고도 맨유에게 역전당했고, 시즌 막판 케빈 키건이 생중계 인터뷰에서 퍼거슨의 심리전에 폭발하며 '정말이지 이기고 싶다'고 외친 장면은 지금도 반복 재생된다. 이듬해 뉴캐슬은 세인트 제임스 파크에서 맨유를 5-0으로 격파하며 되갚았다. 2023년 리그컵 결승에서는 맨유가 2-0으로 이겨 뉴캐슬의 트로피 대기를 2년 더 늘렸다. 세인트 제임스 파크 원정은 맨유 선수들이 가장 시끄러운 곳으로 꼽는 경기장 중 하나다.",
    "tottenham-hotspur":"두 구단은 오랜 무관의 시간을 공유했고, 공교롭게 2025년에 나란히 그것을 끝냈다. 뉴캐슬은 70년 만에 국내 대회 트로피를, 토트넘은 41년 만에 유럽 트로피를 들었다. 맞대결 자체는 라이벌 관계가 아니지만 세인트 제임스 파크 원정은 늘 시끄럽고, 2015-16 시즌 최종전에서 이미 강등이 확정된 뉴캐슬에 크게 진 경기는 토트넘 팬들이 지금도 꺼내기 싫어하는 기억이다. 선수 이동은 잦았다. 무사 시소코(Moussa Sissoko)가 이적시장 마감일에 타인사이드를 떠나 토트넘으로 왔고, 키어런 트리피어(Kieran Trippier)는 반대로 토트넘을 거쳐 뉴캐슬의 주장이 됐다."
  },
  watch:[
    "야이슬레의 부임: 잘츠부르크에서 이름을 알린 감독이 프리미어리그에서 어떤 축구를 꺼내는지.",
    "에디 하우(Eddie Howe) 이후의 전환: 5년간 이어진 팀 구조가 얼마나 바뀌는지.",
    "볼테마데의 최전방: 새 중심 공격수가 리그 수비에 적응하는 속도."
  ]
},

"nottingham-forest": {
  name:"Nottingham Forest", short:"Nott'm Forest", ko:"노팅엄 포레스트", abbr:"NFO",
  nick:"트리키 트리스", founded:1865, city:"노팅엄",
  color:"#DD0000", color2:"#FFFFFF",
  stadium:{ name:"City Ground", ko:"시티 그라운드", capacity:31212, opened:1898,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/CityGroundFromAboveTrentBridgeCricketGround.jpg/1280px-CityGroundFromAboveTrentBridgeCricketGround.jpg",
      credit:"Stadisimo", license:"CC BY 4.0",
      source:"https://commons.wikimedia.org/wiki/File:CityGroundFromAboveTrentBridgeCricketGround.jpg" } },
  manager:{ name:"Oliver Glasner", ko:"올리버 글라스너", since:2026 },
  keyPlayers:[
    { name:"Matz Sels", ko:"마츠 셀스", pos:"GK" },
    { name:"Murillo", ko:"무리요", pos:"DF" },
    { name:"Morgan Gibbs-White", ko:"모건 깁스화이트", pos:"MF" },
    { name:"Chris Wood", ko:"크리스 우드", pos:"FW" },
    { name:"Dan Ndoye", ko:"단 은도예", pos:"FW" }
  ],
  intro:"세계에서 가장 오래된 프로 구단 중 하나이자, 축구사에서 가장 믿기 어려운 이야기를 가진 팀. 브라이언 클러프(Brian Clough)가 2부에 있던 팀을 맡아 리그 우승과 유러피언컵 2연패까지 4년 만에 끌어올렸다. 트렌트강변의 시티 그라운드는 강 건너 노츠 카운티(Notts County) 구장과 마주 보고 있다.",
  history:[
    { y:1865, t:"창단", d:"현존하는 프로 축구 구단 중 손꼽히게 오래된 1865년 창단. 붉은 유니폼은 이탈리아 통일 운동가 가리발디(Garibaldi)에게서 따왔다." },
    { y:1978, t:"승격 직후 리그 우승", d:"클러프가 2부에서 올라온 첫 시즌에 리그를 제패했다. 같은 해 리그컵까지 차지했다." },
    { y:1979, t:"유러피언컵 우승", d:"뮌헨에서 말뫼를 1-0으로 꺾었다. 이듬해 함부르크까지 1-0으로 꺾으며 2연패를 완성했다." },
    { y:2022, t:"23년 만의 복귀", d:"플레이오프 결승에서 허더즈필드를 꺾고 프리미어리그로 돌아왔다." }
  ],
  relations:{
    "manchester-united":"맨유 팬에게 시티 그라운드는 1999년 2월의 기억으로 남아 있다. 맨유가 원정에서 8-1로 이겼고, 올레 군나르 솔샤르(Ole Gunnar Solskjær)가 교체로 들어가 12분 만에 4골을 넣었다. 프리미어리그 원정 최다 점수 차 승리 기록이다. 그전 클러프 시대에는 포레스트가 맨유를 컵 대회에서 여러 번 떨어뜨린 껄끄러운 상대였다. 최근 몇 시즌 동안 포레스트가 시티 그라운드에서 맨유를 상대로 좋은 결과를 만들면서, 좁고 소리가 잘 갇히는 이 경기장이 다시 어려운 원정지로 평가받고 있다.",
    "tottenham-hotspur":"1991년 FA컵 결승이 두 구단 사이의 가장 큰 접점이다. 토트넘이 연장 끝에 포레스트를 꺾고 우승했고, 브라이언 클러프(Brian Clough)는 끝내 FA컵을 들지 못한 감독으로 남았다. 그 경기는 폴 개스코인(Paul Gascoigne)이 초반 무모한 태클로 스스로 무릎을 크게 다쳐 실려 나간 날이기도 하다. 라치오 이적을 앞두고 있던 그의 커리어가 이 한 장면으로 갈렸다는 평가가 지금도 따라다닌다. 최근에는 2025년 여름 모건 깁스화이트(Morgan Gibbs-White) 영입이 막판에 무산되며 포레스트가 공식 항의까지 하는 소동이 있었고, 시티 그라운드 원정에 새로운 긴장이 얹혔다."
  },
  watch:[
    "글라스너의 부임: 팰리스에서 FA컵을 든 감독이 3백 구조를 포레스트에 어떻게 이식하는지.",
    "깁스화이트 중심의 공격: 창의성을 한 선수에게 맡기는 구조가 유지되는지.",
    "잦은 감독 교체 이후: 구단이 이번에는 한 방향을 오래 유지할 수 있는지."
  ]
},

"sunderland": {
  name:"Sunderland", short:"Sunderland", ko:"선덜랜드", abbr:"SUN",
  nick:"블랙 캣츠", founded:1879, city:"선덜랜드",
  color:"#EB172B", color2:"#FFFFFF",
  stadium:{ name:"Stadium of Light", ko:"스타디움 오브 라이트", capacity:48095, opened:1997,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Sunderland_stadium_of_light.jpg/1280px-Sunderland_stadium_of_light.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:Sunderland_stadium_of_light.jpg" } },
  manager:{ name:"Régis Le Bris", ko:"레지스 르 브리", since:2024 },
  keyPlayers:[
    { name:"Robin Roefs", ko:"로빈 루프스", pos:"GK" },
    { name:"Trai Hume", ko:"트라이 흄", pos:"DF" },
    { name:"Granit Xhaka", ko:"그라니트 자카", pos:"MF" },
    { name:"Chris Rigg", ko:"크리스 리그", pos:"MF" },
    { name:"Brian Brobbey", ko:"브라이언 브로베이", pos:"FW" }
  ],
  intro:"리그 우승 6회의 옛 강호이자 3부 추락까지 겪은 북동부 구단. 스타디움 오브 라이트는 옛 탄광 부지 위에 지어졌고, 입구의 데이비 램프(Davy lamp) 조형물이 지역의 광산 역사를 기린다. 2025년 플레이오프 승격 이후 젊은 스쿼드에 경험 있는 자원을 더하는 방식으로 팀을 꾸리고 있다.",
  history:[
    { y:1936, t:"마지막 리그 우승", d:"통산 여섯 번째 1부 타이틀. 이듬해 FA컵까지 들며 전성기를 마감했다." },
    { y:1973, t:"웸블리의 이변", d:"2부 팀으로 FA컵 결승에서 리즈를 1-0으로 꺾었다. 골키퍼 짐 몽고메리(Jim Montgomery)의 연속 선방이 결승전 역사에 남았다." },
    { y:1997, t:"로커 파크를 떠나다", d:"99년간 쓴 로커 파크(Roker Park)를 뒤로하고 옛 탄광 부지에 새 구장을 지었다." },
    { y:2018, t:"3부 추락", d:"2년 연속 강등으로 리그1까지 떨어졌고, 이 시기를 담은 다큐멘터리로 오히려 국제적 팬층이 늘었다." },
    { y:2025, t:"8년 만의 1부 복귀", d:"챔피언십 플레이오프 결승에서 셰필드 유나이티드를 꺾고 프리미어리그로 돌아왔다." }
  ],
  relations:{
    "manchester-united":"맨유 팬이 선덜랜드를 떠올릴 때 가장 먼저 나오는 장면은 2014년 리그컵 준결승 승부차기다. 스타디움 오브 라이트에서 열린 승부차기에서 맨유가 다섯 번 중 네 번을 실패하며 탈락했고, 이 패배가 데이비드 모예스 체제의 붕괴를 상징하는 경기가 됐다. 그보다 앞서 2012년 리그 최종전에서는 선덜랜드가 맨유를 상대로 실점하고도 버텼고, 같은 시각 다른 경기장에서 나온 결과 때문에 맨유가 골 득실로 우승을 놓쳤다. 로이 킨이 선덜랜드 감독으로 올드 트래퍼드에 돌아온 시기도 이 관계에 이야깃거리를 더했다.",
    "tottenham-hotspur":"토트넘과 선덜랜드를 잇는 것은 결과보다 사람이다. 저메인 데포(Jermain Defoe)는 토트넘에서 두 차례 뛰며 사랑받은 뒤 스타디움 오브 라이트에서 커리어의 또 다른 장을 열었고, 다런 벤트(Darren Bent)도 화이트 하트 레인을 떠나 당시 구단 최고 이적료로 선덜랜드에 합류했다. 북동부 원정은 거리가 멀고 바람이 거센 데다 관중이 밀착해 있어 남부 팀에게 늘 부담스러운 일정으로 꼽힌다. 선덜랜드가 오랫동안 하위 리그에 있었던 탓에 두 구단은 여러 해 동안 리그에서 마주치지 못했고, 이번 맞대결은 오랜만의 재회에 가깝다."
  },
  watch:[
    "르 브리 체제 3년 차: 승격을 이끈 감독이 최상위 리그에서 팀을 어떻게 다듬는지.",
    "자카의 중원 장악: 경험 많은 미드필더가 어린 스쿼드의 기준점 역할을 하는지.",
    "리그와 성장의 균형: 리그처럼 어린 유스 자원에게 얼마나 출전 시간을 주는지."
  ]
},

"tottenham-hotspur": {
  name:"Tottenham Hotspur", short:"Spurs", ko:"토트넘 홋스퍼", abbr:"TOT",
  nick:"스퍼스", founded:1882, city:"런던",
  color:"#132257", color2:"#FFFFFF",
  stadium:{ name:"Tottenham Hotspur Stadium", ko:"토트넘 홋스퍼 스타디움", capacity:62850, opened:2019,
    photo:{ url:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/London_Tottenham_Hotspur_Stadium.jpg/1280px-London_Tottenham_Hotspur_Stadium.jpg",
      credit:"Arne Müseler", license:"CC BY-SA 3.0 de",
      source:"https://commons.wikimedia.org/wiki/File:London_Tottenham_Hotspur_Stadium.jpg" } },
  manager:{ name:"Roberto De Zerbi", ko:"로베르토 데 제르비", since:2026 },
  keyPlayers:[
    { name:"Guglielmo Vicario", ko:"굴리엘모 비카리오", pos:"GK" },
    { name:"Micky van de Ven", ko:"미키 판 더 벤", pos:"DF" },
    { name:"Xavi Simons", ko:"사비 시몬스", pos:"MF" },
    { name:"Sandro Tonali", ko:"산드로 토날리", pos:"MF" },
    { name:"Mohammed Kudus", ko:"모하메드 쿠두스", pos:"FW" }
  ],
  intro:"북런던의 구단이자 1961년 20세기 잉글랜드 첫 더블 달성 팀. '이기는 것으로 충분하지 않고 스타일이 있어야 한다'는 오랜 자기 규정이 팬 문화의 중심에 있다. 2019년 문을 연 토트넘 홋스퍼 스타디움은 접이식 잔디로 NFL 경기까지 소화하는 유럽 최신 구장 중 하나다.",
  history:[
    { y:1901, t:"리그 밖에서 딴 FA컵", d:"풋볼리그 소속이 아닌 상태로 FA컵을 차지했다. 프로 시대에 리그 외부 구단이 우승한 마지막 사례다." },
    { y:1961, t:"20세기 첫 더블", d:"리그와 FA컵을 같은 시즌에 제패. 1897년 이후 아무도 하지 못한 기록이었다." },
    { y:1963, t:"유럽 트로피를 든 첫 잉글랜드 구단", d:"컵위너스컵 결승에서 아틀레티코 마드리드를 5-1로 꺾었다." },
    { y:2019, t:"새 구장 개장", d:"화이트 하트 레인 자리에 6만 2천 석 규모의 새 경기장을 열었다. 같은 해 챔피언스리그 결승에도 올랐다." },
    { y:2025, t:"41년 만의 유럽 트로피", d:"빌바오에서 열린 유로파리그 결승에서 맨유를 1-0으로 꺾고 우승했다." }
  ],
  relations:{
    "manchester-united":"두 구단의 가장 최근이자 가장 아픈 접점은 2025년 5월 21일 빌바오다. 유로파리그 결승에서 토트넘이 맨유를 1-0으로 꺾고 41년 만의 유럽 트로피를 들었고, 맨유는 다음 시즌 유럽 대항전 진출권까지 함께 놓쳤다. 그전까지 맨유 팬에게 토트넘전의 대표 기억은 2001년 화이트 하트 레인이었다. 전반을 0-3으로 뒤진 채 마치고 후반에만 다섯 골을 넣어 5-3으로 뒤집은 경기다. 그 역전의 상징성이 24년 뒤 빌바오의 결과로 상쇄된 셈이라, 두 팀의 맞대결은 최근 몇 년 사이 확실히 감정의 온도가 올라갔다."
  },
  seasonNote:"2026-27 시즌은 로베르토 데 제르비가 맞는 첫 시즌이다. 브라이턴에서 상대를 후방으로 끌어들였다가 한 번에 뒤집는 빌드업으로 이름을 알린 감독이, 훨씬 두껍고 값비싼 스쿼드에서 같은 원칙을 세울 수 있는지가 시즌 내내 따라붙는 질문이다. 2025년 유로파리그 우승으로 41년의 무관이 끝난 뒤 구단의 기준선도 달라졌다. 트로피 하나로 만족할지, 리그 순위와 유럽 무대를 함께 끌어올릴지가 이제 팬들이 던지는 요구다. 2019년 문을 연 새 구장은 유럽 최상위권 수익 기반을 만들어줬고, 그만큼 '스타일은 있는데 결과가 없다'는 오래된 자조가 더는 통하지 않는 환경이 됐다. 사비 시몬스와 산드로 토날리를 축으로 새로 짠 중원이 얼마나 빨리 자리 잡느냐가 시즌 초반의 관전 포인트다.",
  watch:[
    "데 제르비의 부임: 브라이턴에서 보여준 후방 유인 빌드업을 더 큰 스쿼드에서 구현할 수 있는지.",
    "토날리와 시몬스의 중원: 새로 짠 미드필드 조합이 자리 잡는 데 걸리는 시간.",
    "유럽 우승 이후: 트로피를 든 다음 시즌에 리그 순위를 함께 끌어올릴 수 있는지."
  ]
}

};

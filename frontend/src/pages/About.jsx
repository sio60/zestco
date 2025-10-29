// frontend/src/pages/About.jsx
import React, { useMemo } from "react";
import "../styles/about.css"; // 이전에 준 CSS 재사용 (tl, about-*)

const DATA = {
  headings: {
    ko: { greet: "C.E.O인사말", msg: "제스트코는 당신을 응원합니다!" },
    en: { greet: "Message from C.E.O", msg: "Every moment with Zestco" },
  },
  statements: {
    ko: [
      "약속드립니다! 엄마의 마음으로 진심을 담아 신뢰를 주는 기업이 되겠습니다.",
      "노력하겠습니다! 새로운 도전을 통해 항상 성장하는 기업이 되겠습니다.",
      "최고가 되겠습니다! 소비자가 안심하고 믿는 기업이 되겠습니다.",
    ],
    en: [
      "We promise! We will inspire customers faith sincerely with mother’s heart.",
      "We try! We will be always growing with new challenges.",
      "We be the best! We will be a company that consumers feel safe with and trust in.",
    ],
  },
  timeline: [
    // ==== 2025 ====
    {
      year: 2025,
      title_ko: "브레드이발소 치킨너겟 기획출시",
      title_en: "Bread Barbershop chicken nugget Lunched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/10/대지-1-80.jpg",
    },
    {
      year: 2025,
      title_ko: "클로버 재즈 팝콘 출시",
      title_en: "Clover jazz popcorn",
      image: "http://zestco.co.kr/wp-content/uploads/2025/10/자산-1.png",
    },
    {
      year: 2025,
      title_ko: "야마다 시오다래 소스 출시",
      title_en: "Yamada Shiodada sauce",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/10/시오다래-소스-이미지.png",
    },
    {
      year: 2025,
      title_ko: "오레오 아이스크림 샌드위치 출시",
      title_en: "Oreo ice cream sandwich Lunched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/09/%EC%98%A4%EB%A0%88%EC%98%A4-%EC%95%84%EC%9D%B4%EC%8A%A4%ED%81%AC%EB%A6%BC-%EC%83%8C%EB%93%9C%EC%9C%84%EC%B9%98-%ED%95%84%EB%A6%AC%ED%95%80-300x300.png",
    },
    {
      year: 2025,
      title_ko: "브레드이발소 팝콘치킨 기획 출시",
      title_en: "Bread Barbershop Popcorn chicken Lunched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/09/20250910_브레드이발소-팝콘치킨.jpg",
    },
    {
      year: 2025,
      title_ko: "브레드이발소 미니 돈까스 기획 출시",
      title_en: "Bread Barbershop Mini pork cutlet Lunched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/07/ㄷㄷㄷㄷㄷ_대지-1_대지-1.jpg",
    },
    {
      year: 2025,
      title_ko: "픽스타치오 제로바 기획 출시",
      title_en: "Pickstachio Zero Bar Launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/06/픽스타치오-하얀5-e1750657386457.png",
    },
    {
      year: 2025,
      title_ko: "메시 트루 야채 비스킷 출시",
      title_en: "Mesi True Vegetable Biscuits Launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/06/ㅂㅂ.png",
    },
    {
      year: 2025,
      title_ko: "도나파올라 오일 5종 출시",
      title_en: "5 types of Donna Paola oil released",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/06/자산-1.png",
    },

    // ==== 2024 ====
    {
      year: 2024,
      title_ko: "이발사파르페 (발사믹 아이스크림) 기획 출시",
      title_en: "Barber Parfait (Balsamic Ice Cream) Planned Launch",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/06/이발사-파르페-목업-수정본2-1.png",
    },
    {
      year: 2024,
      title_ko: "生키리모찌 출시",
      title_en: "Kirimozzi Launch",
      image:
        "http://zestco.co.kr/wp-content/uploads/2025/06/키모-앞면-누끼-1030x773.png",
    },
    {
      year: 2024,
      title_ko: "강릉초당순두부제로바 기획 출시",
      title_en:
        "Gangneung Chodang Soft Tofu Zero Bar Planned Launch",
      image:
        "http://zestco.co.kr/wp-content/uploads/2024/07/강릉초당순두부-제로바-목업-1030x755.png",
    },
    {
      year: 2024,
      title_ko: "복음자리 딸기잼콘 기획 출시",
      title_en: "Bokumjari Strawberry Jam Cone Ice Cream launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2024/04/복음자리-딸기잼콘-이미지.png",
    },
    {
      year: 2024,
      title_ko: "덴마크 초코초코바 기획 출시",
      title_en: "Denmark Choco Choco Bar launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2024/03/덴마크-초코초코바-이미지-1030x1030.png",
    },
    {
      year: 2024,
      title_ko: "강릉초당순두부 ZERO 기획 출시",
      title_en: "Gangneung Chodang Soft Tofu ZERO launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2024/01/강릉초당순두부ZERO-정면-목업-1030x773.png",
    },

    // ==== 2023 ====
    {
      year: 2023,
      title_ko: "덴마크 초코초코콘 기획 출시",
      title_en: "Denmark Choco Choco Cone Ice Cream launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2023/09/230811_덴마크초코초코콘_최종완성_목업_노그림자.png",
    },
    {
      year: 2023,
      title_ko: "모구모구 리치 요거트바 기획 출시",
      title_en: "Mogu Mogu lychee Yogurt Bar launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2023/05/모구모구-목업.png",
    },
    {
      year: 2023,
      title_ko: "곰표 자일리톨 캔디 기획 출시",
      title_en: "Gompyo Xylitol Candy launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2023/03/곰표캔디-목업-사본.png",
    },

    // ==== 2022 ====
    {
      year: 2022,
      title_ko: "오뚜기 순후추콘 기획 출시",
      title_en: "Ottogi Black Pepper Powder Ice Cream launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2022/11/오뚜기-순후추콘-목업.png",
    },
    {
      year: 2022,
      title_ko: "곰표 크림치즈바 기획 출시",
      title_en: "Gompyo Cream Cheese Bar launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2022/06/곰표-크림치즈바_고화질.png",
    },

    // ==== 2021 ====
    {
      year: 2021,
      title_ko: "허니버터와플콘 기획 출시",
      title_en: "Honey Butter Waffle Cone launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2021/11/허니버터와플콘-목업.png",
    },
    {
      year: 2021,
      title_ko: "킷캣 아이스크림 스틱 출시",
      title_en: "Kitkat Ice Cream Stick launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2021/10/킷캣-목업-1030x755.png",
    },
    {
      year: 2021,
      title_ko: "오레오 아이스크림 스틱&샌드 출시",
      title_en: "Oreo Ice Cream Stick & Sand launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2021/10/제목-없음-1-1-1030x350.jpg",
    },
    {
      year: 2021,
      title_ko: "곰표 밀눈 아이스크림 콘 기획 출시",
      title_en: "Gompyo Wheat-Germ Ice Cream launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2021/03/정면2-e1616055306607.jpg",
    },

    // ==== 2020 ====
    {
      year: 2020,
      title_ko: "강릉초당순두부아이스크림 기획 출시",
      title_en: "Gangneung Chodang Soft Tofu Ice Cream launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2020/06/주석-2020-06-03-104838-845x307.jpg",
    },

    // ==== 2018 ====
    {
      year: 2018,
      title_ko: "프리젤 캔디 출시",
      title_en: "Freegells candy launched",
      image:
        "http://zestco.co.kr/wp-content/uploads/2020/03/freegells.jpg",
    },

    // ==== 2017 ====
    {
      year: 2017,
      title_ko: "젤리벨리 편의점 납품",
      title_en: "Distributed Jelly Belly at CVS",
      image:
        "http://zestco.co.kr/wp-content/uploads/2020/02/젤리벨리-그레이프바180705-1m-1030x517.jpg",
    },

    // ==== 2015 ====
    {
      year: 2015,
      title_ko: "자몽 스파클링  /  청포도 톡톡 음료 출시",
      title_en:
        "Grapefruit Sparking / Green Grape Tok Tok drink launched",
      image:
        "http://zestcoice.cafe24.com/wp-content/uploads/2020/02/자몽-청포도.png",
    },

    // ==== 2014 ====
    {
      year: 2014,
      title_ko: "허쉬 아이스크림 편의점 납품",
      title_en: "Distributed Hershey’s Ice Cream at CVS",
      image:
        "http://zestco.co.kr/wp-content/uploads/2020/02/허쉬-아이스크림-1030x735.png",
    },

    // ==== 2012 ====
    {
      year: 2012,
      title_ko: "제스트코 설립",
      title_en: "Established Zestco Co.",
      image: "",
    },
  ],
};

function Divider({ color = "#80ad3d" }) {
  return (
    <div className="about-divider">
      <span style={{ borderColor: color }} />
    </div>
  );
}

function TimelineItem({ item, align = "left" }) {
  return (
    <li className={`tl-item ${align}`}>
      <div className="tl-year">{item.year}</div>
      <article className="tl-card">
        <h4 className="tl-title">{item.title_ko}</h4>
        {item.title_en && <p className="tl-sub">{item.title_en}</p>}
        {item.image ? (
          <img
            className="tl-img"
            src={item.image}
            alt={item.title_ko}
            loading="lazy"
          />
        ) : null}
      </article>
    </li>
  );
}

export default function About() {
  const items = useMemo(() => {
    const arr = DATA.timeline.slice().sort((a, b) => b.year - a.year);
    return arr.map((it, idx) => ({ it, align: idx % 2 === 0 ? "left" : "right" }));
  }, []);

  const H = DATA.headings;
  const S = DATA.statements;

  return (
    <main className="about-wrap">
      {/* CEO 인사말 (KO) */}
      <section className="about-block">
        <h2 className="about-h2">{H.ko.greet}</h2>
        <Divider color="#80ad3d" />
        <h3 className="about-h3">{H.ko.msg}</h3>
        <ul className="about-list">
          {S.ko.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      {/* CEO Message (EN) */}
      <section className="about-block">
        <h2 className="about-h2 muted">{H.en.greet}</h2>
        <Divider color="#3d3d3d" />
        <h3 className="about-h3">{H.en.msg}</h3>
        <ul className="about-list">
          {S.en.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      {/* History */}
      <section className="about-block">
        <h2 className="about-h2">History</h2>
        <Divider color="#80ad3d" />
        <ul className="tl">
          {items.map(({ it, align }, i) => (
            <TimelineItem key={`${it.year}-${i}`} item={it} align={align} />
          ))}
        </ul>
      </section>
    </main>
  );
}

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";

function App() {
  return (
    <>
      <Header />
      {/* 오버레이 텍스트/버튼 제거, 잘림 방지용 contain */}
      <Hero fit="contain" />
      <main className="page">
        <section className="demo">
          <h1>홈 섹션</h1>
          <p>여기에 메인 콘텐츠 넣으면 됨.</p>
        </section>
      </main>
    </>
  );
}

export default App;

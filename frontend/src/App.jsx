import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./pages/About.jsx"; // 페이지 추가 예시

// 홈 섹션을 따로 컴포넌트로 분리
function Home() {
  return (
    <>
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

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* 홈 */}
        <Route path="/" element={<Home />} />

        {/* 어바웃 페이지 */}
        <Route path="/about" element={<About />} />

        {/* 추후 다른 페이지들 추가 */}
        {/* <Route path="/brand" element={<Brand />} /> */}
        {/* <Route path="/products" element={<Products />} /> */}
        {/* <Route path="/stores" element={<Stores />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        {/* <Route path="/notice" element={<Notice />} /> */}

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <main className="page">
              <section className="demo">
                <h1>페이지를 찾을 수 없습니다 😢</h1>
              </section>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

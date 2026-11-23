import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../conf/api";
// import MENU from "../conf/menu";
import useMenu from "../conf/menu";
import useSpeech from "../conf/useSpeech";
import Numpad from "../components/Numpad";
import { logoutUser } from "../services/authService";
import getErrorMessage from "../utils/getErrorMessage";
import { clearUser } from "../store/authSlice";


export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { speak, stop, speaking, supported, hasHindiVoice } = useSpeech("hi-IN");

  const [digits, setDigits] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuIndex, setMenuIndex] = useState(-1); // item being read right now
  const menuRun = useRef(0);
  const { items: menuItems, loading: menuLoading } = useMenu();

  const stopAll = () => {
    menuRun.current++; // cancels the menu loop
    stop();
    setMenuIndex(-1);
  };

  // read the menu one item at a time
    // read the menu one item at a time
  const playMenu = async () => {
    if (!menuItems || menuItems.length === 0) return;
    stopAll();
    const run = ++menuRun.current;
    for (let i = 0; i < menuItems.length; i++) {
      if (run !== menuRun.current) return;
      setMenuIndex(i);
      await speak(`${menuItems[i].key} दबाइए, ${menuItems[i].label}`);
      await new Promise((r) => setTimeout(r, 400));
    }
    if (run === menuRun.current) setMenuIndex(-1);
  };

  const onDigit = (d) => setDigits((p) => (p.length < 2 ? p + d : p));
  const onBack = () => setDigits((p) => p.slice(0, -1));

    const onSubmit = async () => {
    const n = parseInt(digits, 10);
    if (!(n >= 1 && n <= menuItems.length)) {
      setError(`1 से ${menuItems.length} के बीच नंबर दबाइए`);
      return;
    }
    stopAll();
    setError("");
    setAnswer("");
    setLoading(true);
    try {
      const res = await api.post("/prompt", { key: String(n) });
      const text = res.data.data.text;
      setAnswer(text);
      setDigits("");
      speak(text);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
  stopAll();
  try {
    await logoutUser();
  } catch {
    // Ignore server error so user is still logged out locally
  } finally {
    dispatch(clearUser());
    navigate("/login", { replace: true });
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">नमस्ते, {user.fullname}</h1>
          <button onClick={onLogout} className="rounded bg-red-600 px-3 py-1 text-sm text-white">
            Logout
          </button>
        </div>

        {supported && !hasHindiVoice && (
          <p className="rounded bg-yellow-100 p-2 text-sm text-yellow-800">
            इस डिवाइस पर हिंदी आवाज़ नहीं मिली। आवाज़ साफ़ न आए तो डिवाइस में Hindi voice इंस्टॉल करें।
          </p>
        )}
        {!supported && (
          <p className="rounded bg-yellow-100 p-2 text-sm text-yellow-800">
            यह ब्राउज़र आवाज़ (speech) सपोर्ट नहीं करता।
          </p>
        )}

        {/* menu */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">मेनू</h2>
            <button
              onClick={menuIndex >= 0 ? stopAll : playMenu}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
            >
              {menuIndex >= 0 ? "⏹ रोकें" : "🔊 मेनू सुनें"}
            </button>
          </div>
                    <ul className="space-y-1">
            {menuLoading && <p className="text-sm text-gray-500 py-2">मेनू लोड हो रहा है...</p>}
            {menuItems?.map((m, i) => (
              <li
                key={m.key}
                onClick={() => setDigits(m.key)}
                className={`cursor-pointer rounded px-2 py-1 ${
                  i === menuIndex ? "bg-yellow-200 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                {m.key}. {m.label}
              </li>
            ))}
          </ul>
        </div>

        {/* display + numpad */}
        <div className="rounded-lg bg-white p-4 shadow space-y-3">
          <div className="h-14 rounded bg-gray-900 px-4 text-right text-3xl leading-[3.5rem] text-green-400">
            {digits || "—"}
          </div>
          <Numpad onDigit={onDigit} onClear={onBack} onSubmit={onSubmit} submitDisabled={loading} />
        </div>

        {error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-center text-gray-600">जवाब आ रहा है...</p>}

        {/* answer */}
        {answer && (
          <div className="rounded-lg bg-white p-4 shadow space-y-3">
            <p className="whitespace-pre-wrap text-lg leading-relaxed">{answer}</p>
            <button
              onClick={speaking ? stop : () => speak(answer)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
            >
              {speaking ? "⏹ रोकें" : "🔊 फिर से सुनें"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
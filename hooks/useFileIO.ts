
import { useRef, ChangeEvent } from 'react';
import { VisualNovel } from '../types';
import { LOCAL_STORAGE_KEY, EMPTY_VN } from '../constants';
import { exportToRenpy, exportToHtml } from '../services/exportService';

interface UseFileIOProps {
  vn: VisualNovel;
  setVisualNovel: (vn: VisualNovel) => void;
  setSelectedSceneId: (id: string) => void;
}

export const useFileIO = ({ vn, setVisualNovel, setSelectedSceneId }: UseFileIOProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveToLocalStorage = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vn));
      alert('프로젝트가 브라우저에 임시 저장되었습니다!');
    } catch (e) {
      console.error("데이터 저장에 실패했습니다", e);
      alert('오류: 프로젝트를 브라우저에 저장할 수 없습니다.');
    }
  };

  const handleSaveToFile = () => {
    try {
      const jsonString = JSON.stringify(vn, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
      const safeTitle = vn.title.replace(/[^a-z0-9\u3131-\uD79D]/gi, '_').substring(0, 20);
      
      a.download = `${safeTitle}_${dateStr}_${timeStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("파일 저장 실패", e);
      alert('오류: 파일을 저장할 수 없습니다.');
    }
  };

  const handleLoadFromFileClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error("파일이 텍스트가 아닙니다.");
        const parsedData = JSON.parse(text);

        if (!parsedData.title || !parsedData.scenes || !parsedData.characters || !parsedData.startSceneId) {
            throw new Error("파일 형식이 올바르지 않습니다. 필수 필드가 누락되었습니다.");
        }

        if (window.confirm('현재 프로젝트를 덮어쓰고 파일에서 불러오시겠습니까? 저장되지 않은 변경 사항은 사라집니다.')) {
          setVisualNovel(parsedData);
          setSelectedSceneId(parsedData.startSceneId);
          alert('프로젝트(이미지 포함)를 성공적으로 불러왔습니다!');
        }
      } catch (err) {
        console.error("파일 불러오기 실패", err);
        alert(`오류: 파일을 불러올 수 없습니다. ${err instanceof Error ? err.message : ''}`);
      } finally {
          if(e.target) e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
      if(e.target) e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportToRenpy = () => {
    try {
      const renpyScript = exportToRenpy(vn);
      const blob = new Blob([renpyScript], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = vn.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle || 'visual-novel-script'}.rpy`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Ren'Py 스크립트 내보내기 실패", e);
      alert("오류: Ren'Py 스크립트를 내보낼 수 없습니다.");
    }
  };

  const handleExportToHtml = () => {
    try {
      const htmlContent = exportToHtml(vn);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const safeTitle = vn.title.replace(/[^a-z0-9\u3131-\uD79D]/gi, '_').substring(0, 20);
      
      a.download = `${safeTitle}_GAME_${dateStr}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("HTML 내보내기 실패", e);
      alert("오류: 웹 게임 파일(.html)을 생성할 수 없습니다.");
    }
  };

  const handleReset = () => {
    if (window.confirm('프로젝트를 완전히 초기화하시겠습니까? 모든 내용이 삭제되며, 되돌릴 수 없습니다.')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setVisualNovel(EMPTY_VN);
      setSelectedSceneId(EMPTY_VN.startSceneId);
    }
  };

  return {
    fileInputRef,
    handleSaveToLocalStorage,
    handleSaveToFile,
    handleLoadFromFileClick,
    handleFileSelected,
    handleExportToRenpy,
    handleExportToHtml,
    handleReset
  };
};

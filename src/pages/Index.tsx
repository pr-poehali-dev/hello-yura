import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [showEditor, setShowEditor] = useState(() => {
    return localStorage.getItem('plutka-editor-active') === 'true';
  });
  const [htmlCode, setHtmlCode] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <title>My Site</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}');
  const [jsCode, setJsCode] = useState('console.log("Hello from JS!");');
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [publishUrl, setPublishUrl] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shakeButton, setShakeButton] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState<Array<{name: string, html: string, css: string, js: string, description: string}>>([]);
  const [showProjectsDialog, setShowProjectsDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('plutka-projects');
    if (saved) {
      setSavedProjects(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (htmlCode || cssCode || jsCode || description) {
      const project = { html: htmlCode, css: cssCode, js: jsCode, description };
      localStorage.setItem('plutka-current-project', JSON.stringify(project));
    }
  }, [htmlCode, cssCode, jsCode, description]);

  const handleCreateSite = () => {
    setShakeButton(true);
    setTimeout(() => {
      const saved = localStorage.getItem('plutka-current-project');
      if (saved) {
        const project = JSON.parse(saved);
        setHtmlCode(project.html);
        setCssCode(project.css);
        setJsCode(project.js);
        setDescription(project.description);
      }
      setShowEditor(true);
      localStorage.setItem('plutka-editor-active', 'true');
      setShakeButton(false);
    }, 500);
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert('Введите название проекта!');
      return;
    }
    const newProject = {
      name: projectName,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      description
    };
    const updated = [...savedProjects.filter(p => p.name !== projectName), newProject];
    setSavedProjects(updated);
    localStorage.setItem('plutka-projects', JSON.stringify(updated));
    setProjectName('');
    alert('Проект сохранен!');
  };

  const handleLoadProject = (project: {name: string, html: string, css: string, js: string, description: string}) => {
    setHtmlCode(project.html);
    setCssCode(project.css);
    setJsCode(project.js);
    setDescription(project.description);
    setProjectName(project.name);
    setShowProjectsDialog(false);
  };

  const handleDeleteProject = (name: string) => {
    const updated = savedProjects.filter(p => p.name !== name);
    setSavedProjects(updated);
    localStorage.setItem('plutka-projects', JSON.stringify(updated));
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = () => {
    const blob = new Blob([getPreviewContent()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'website'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateLink = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/a38f3a37-cfe9-4314-94cb-8ced7facf8fe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlCode,
          css: cssCode,
          js: jsCode,
          projectName: projectName || 'Untitled',
          description: description
        })
      });
      
      const data = await response.json();
      const shareUrl = `https://functions.poehali.dev/a38f3a37-cfe9-4314-94cb-8ced7facf8fe?id=${data.siteId}`;
      setPublishUrl(shareUrl);
      setShowPublishDialog(true);
    } catch (error) {
      alert('Ошибка при публикации: ' + error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getPreviewContent = () => {
    return `
      ${htmlCode}
      <style>${cssCode}</style>
      <script>${jsCode}</script>
    `;
  };

  if (!showEditor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 retro-bg relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none"></div>
        <div className="text-center space-y-6 animate-pixel-fade-in w-full max-w-md relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4 animate-float">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary pixel-border flex items-center justify-center flex-shrink-0 animate-pulse-glow">
              <Icon name="Code2" size={24} className="text-black md:w-8 md:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] break-words leading-relaxed">
              PlutkaEdit
            </h1>
          </div>
          
          <p className="text-primary text-xs sm:text-sm leading-relaxed opacity-80">
            CREATE WEBSITES<br/>HTML • CSS • JS
          </p>

          <Button 
            onClick={handleCreateSite}
            size="lg"
            className={`bg-primary hover:bg-primary text-black font-bold px-6 py-6 text-xs sm:text-sm w-full sm:w-auto pixel-border transition-all ${
              shakeButton ? 'animate-shake' : ''
            }`}
          >
            <Icon name="Zap" size={16} className="mr-2" />
            START
          </Button>
          
          <div className="flex gap-2 justify-center mt-4">
            <div className="w-2 h-2 bg-primary animate-pulse"></div>
            <div className="w-2 h-2 bg-primary animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-primary animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col retro-bg">
      <header className="border-b-4 border-primary bg-card sticky top-0 z-10 pixel-border">
        <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary pixel-border flex items-center justify-center flex-shrink-0">
              <Icon name="Code2" size={14} className="text-black sm:w-[18px] sm:h-[18px]" />
            </div>
            <h1 className="text-[8px] sm:text-xs font-bold text-primary truncate">PlutkaEdit</h1>
          </div>
          
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button 
              onClick={() => setShowProjectsDialog(true)}
              size="sm"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-black p-1 sm:px-2 text-[8px] sm:text-xs pixel-border transition-all"
            >
              <Icon name="FolderOpen" size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">FILES</span>
            </Button>
            <Button 
              onClick={handlePreview}
              size="sm"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-black p-1 sm:px-2 text-[8px] sm:text-xs pixel-border transition-all"
            >
              <Icon name="Eye" size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">VIEW</span>
            </Button>
            <Button 
              onClick={handleGenerateLink}
              size="sm"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-black p-1 sm:px-2 text-[8px] sm:text-xs pixel-border transition-all"
              disabled={isPublishing}
            >
              <Icon name="Globe" size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">{isPublishing ? 'WAIT...' : 'LINK'}</span>
            </Button>
            <Button 
              onClick={handlePublish}
              size="sm"
              className="bg-primary hover:bg-primary text-black font-bold p-1 sm:px-2 text-[8px] sm:text-xs pixel-border transition-all"
            >
              <Icon name="Download" size={12} className="sm:mr-1" />
              <span className="hidden sm:inline">SAVE</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-2 py-3 sm:px-4 sm:py-4 overflow-auto">
        <Card className="bg-card border-4 border-primary p-3 sm:p-4 space-y-3 pixel-border animate-pixel-fade-in">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-primary mb-1 block font-bold">NAME:</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="MY-SITE"
                className="bg-secondary border-2 border-primary text-white text-xs h-9 pixel-border code-editor"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-primary mb-1 block font-bold">DESC:</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="DESCRIPTION..."
                className="bg-secondary border-2 border-primary text-white text-xs h-9 pixel-border code-editor"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSaveProject}
                size="sm"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-black w-full sm:w-auto h-9 text-[10px] pixel-border font-bold"
              >
                <Icon name="Save" size={12} className="mr-1" />
                SAVE
              </Button>
            </div>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="bg-secondary border-b-4 border-primary w-full justify-start h-10 gap-1">
              <TabsTrigger 
                value="html" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-primary text-[10px] sm:text-xs px-2 sm:px-3 font-bold pixel-border data-[state=active]:animate-glitch"
              >
                <Icon name="FileCode" size={12} className="mr-1" />
                HTML
              </TabsTrigger>
              <TabsTrigger 
                value="css"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-primary text-[10px] sm:text-xs px-2 sm:px-3 font-bold pixel-border data-[state=active]:animate-glitch"
              >
                <Icon name="Palette" size={12} className="mr-1" />
                CSS
              </TabsTrigger>
              <TabsTrigger 
                value="js"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-primary text-[10px] sm:text-xs px-2 sm:px-3 font-bold pixel-border data-[state=active]:animate-glitch"
              >
                <Icon name="Zap" size={12} className="mr-1" />
                JS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-0">
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="code-editor text-xs sm:text-sm bg-secondary border-2 border-primary text-white min-h-[300px] sm:min-h-[400px] resize-none focus:border-primary focus:ring-2 focus:ring-primary"
                placeholder="> ENTER HTML CODE..."
              />
            </TabsContent>

            <TabsContent value="css" className="mt-0">
              <Textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                className="code-editor text-xs sm:text-sm bg-secondary border-2 border-primary text-white min-h-[300px] sm:min-h-[400px] resize-none focus:border-primary focus:ring-2 focus:ring-primary"
                placeholder="> ENTER CSS CODE..."
              />
            </TabsContent>

            <TabsContent value="js" className="mt-0">
              <Textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                className="code-editor text-xs sm:text-sm bg-secondary border-2 border-primary text-white min-h-[300px] sm:min-h-[400px] resize-none focus:border-primary focus:ring-2 focus:ring-primary"
                placeholder="> ENTER JS CODE..."
              />
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[85vh] bg-card border-border p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-white text-sm sm:text-base">Превью сайта</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-white rounded overflow-hidden mt-2">
            <iframe
              srcDoc={getPreviewContent()}
              className="w-full h-full"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-lg p-4">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
              <Icon name="Globe" size={20} className="text-primary" />
              Ссылка на сайт
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs sm:text-sm">Поделитесь этой ссылкой с коллегами для просмотра:</p>
            <div className="bg-secondary border border-border rounded p-2 break-all text-xs text-white max-h-32 overflow-y-auto">
              {publishUrl}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigator.clipboard.writeText(publishUrl)}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary hover:text-black text-xs sm:text-sm"
              >
                <Icon name="Copy" size={14} className="mr-1" />
                Копировать
              </Button>
              <Button
                onClick={() => window.open(publishUrl, '_blank')}
                className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold text-xs sm:text-sm"
              >
                <Icon name="ExternalLink" size={14} className="mr-1" />
                Открыть
              </Button>
            </div>
            <p className="text-muted-foreground text-xs italic">✨ Сайт опубликован онлайн! Ссылка работает у всех, кто её откроет.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProjectsDialog} onOpenChange={setShowProjectsDialog}>
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
              <Icon name="FolderOpen" size={20} className="text-primary" />
              Сохраненные проекты
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {savedProjects.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">Пока нет сохраненных проектов</p>
            ) : (
              savedProjects.map((project) => (
                <Card key={project.name} className="bg-secondary border-border p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{project.name}</h3>
                    <p className="text-muted-foreground text-xs truncate">{project.description || 'Без описания'}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => handleLoadProject(project)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-black flex-1 sm:flex-none text-xs"
                    >
                      <Icon name="Upload" size={12} className="mr-1" />
                      Загрузить
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project.name)}
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-white px-2"
                    >
                      <Icon name="Trash2" size={12} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
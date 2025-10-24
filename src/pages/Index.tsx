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

  const handleGenerateLink = () => {
    const content = getPreviewContent();
    const encoded = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:text/html;base64,${encoded}`;
    setPublishUrl(dataUrl);
    setShowPublishDialog(true);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
        <div className="text-center space-y-6 animate-fade-in w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Code2" size={24} className="text-black md:w-8 md:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white break-words">PlutkaEditSite</h1>
          </div>
          
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Создавайте сайты с помощью HTML, CSS и JavaScript
          </p>

          <Button 
            onClick={handleCreateSite}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-black font-semibold px-6 py-5 text-base w-full sm:w-auto"
          >
            Создать сайт
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <Icon name="Code2" size={14} className="text-black sm:w-[18px] sm:h-[18px]" />
            </div>
            <h1 className="text-sm sm:text-xl font-bold text-white truncate">PlutkaEdit</h1>
          </div>
          
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button 
              onClick={() => setShowProjectsDialog(true)}
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-black p-2 sm:px-3"
            >
              <Icon name="FolderOpen" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Проекты</span>
            </Button>
            <Button 
              onClick={handlePreview}
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-black p-2 sm:px-3"
            >
              <Icon name="Eye" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Превью</span>
            </Button>
            <Button 
              onClick={handleGenerateLink}
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-black p-2 sm:px-3"
            >
              <Icon name="Globe" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Ссылка</span>
            </Button>
            <Button 
              onClick={handlePublish}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-black font-semibold p-2 sm:px-3"
            >
              <Icon name="Download" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">HTML</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-2 py-3 sm:px-4 sm:py-4 overflow-auto">
        <Card className="bg-card border-border p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">Название</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Мой сайт"
                className="bg-secondary border-border text-white text-sm h-9"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание..."
                className="bg-secondary border-border text-white text-sm h-9"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSaveProject}
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-black w-full sm:w-auto h-9"
              >
                <Icon name="Save" size={14} className="mr-1" />
                Сохранить
              </Button>
            </div>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="bg-secondary border-b border-border w-full justify-start rounded-none h-10">
              <TabsTrigger 
                value="html" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-muted-foreground text-xs sm:text-sm px-2 sm:px-4"
              >
                <Icon name="FileCode" size={14} className="mr-1" />
                HTML
              </TabsTrigger>
              <TabsTrigger 
                value="css"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-muted-foreground text-xs sm:text-sm px-2 sm:px-4"
              >
                <Icon name="Palette" size={14} className="mr-1" />
                CSS
              </TabsTrigger>
              <TabsTrigger 
                value="js"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-muted-foreground text-xs sm:text-sm px-2 sm:px-4"
              >
                <Icon name="Zap" size={14} className="mr-1" />
                JS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-0">
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="font-mono text-xs sm:text-sm bg-secondary border-border text-white min-h-[300px] sm:min-h-[400px] resize-none"
                placeholder="Введите HTML код..."
              />
            </TabsContent>

            <TabsContent value="css" className="mt-0">
              <Textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                className="font-mono text-xs sm:text-sm bg-secondary border-border text-white min-h-[300px] sm:min-h-[400px] resize-none"
                placeholder="Введите CSS код..."
              />
            </TabsContent>

            <TabsContent value="js" className="mt-0">
              <Textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                className="font-mono text-xs sm:text-sm bg-secondary border-border text-white min-h-[300px] sm:min-h-[400px] resize-none"
                placeholder="Введите JavaScript код..."
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
            <p className="text-muted-foreground text-xs sm:text-sm">Откройте эту ссылку в новой вкладке для просмотра:</p>
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
            <p className="text-muted-foreground text-xs italic">Примечание: Ссылка работает локально в вашем браузере. Для публикации в интернете скачайте HTML файл.</p>
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
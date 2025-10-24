import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [htmlCode, setHtmlCode] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <title>My Site</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>');
  const [cssCode, setCssCode] = useState('body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}');
  const [jsCode, setJsCode] = useState('console.log("Hello from JS!");');
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [publishUrl, setPublishUrl] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const handleCreateSite = () => {
    setShowEditor(true);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = () => {
    const randomId = Math.random().toString(36).substring(7);
    const url = `https://plutka-${randomId}.plutkaedit.site`;
    setPublishUrl(url);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Code2" size={32} className="text-black" />
            </div>
            <h1 className="text-5xl font-bold text-white">PlutkaEditSite</h1>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-md">
            Создавайте сайты с помощью HTML, CSS и JavaScript
          </p>

          <Button 
            onClick={handleCreateSite}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-6 text-lg"
          >
            Создать сайт
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Icon name="Code2" size={18} className="text-black" />
            </div>
            <h1 className="text-xl font-bold text-white">PlutkaEditSite</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePreview}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-black"
            >
              <Icon name="Eye" size={16} className="mr-2" />
              Превью
            </Button>
            <Button 
              onClick={handlePublish}
              className="bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              <Icon name="Globe" size={16} className="mr-2" />
              Опубликовать
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="bg-card border-border p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Описание проекта</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите ваш проект..."
              className="bg-secondary border-border text-white"
            />
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="bg-secondary border-b border-border w-full justify-start rounded-none h-12">
              <TabsTrigger 
                value="html" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-muted-foreground"
              >
                <Icon name="FileCode" size={16} className="mr-2" />
                HTML
              </TabsTrigger>
              <TabsTrigger 
                value="css"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-muted-foreground"
              >
                <Icon name="Palette" size={16} className="mr-2" />
                CSS
              </TabsTrigger>
              <TabsTrigger 
                value="js"
                className="data-[state=active]:bg-primary data-[state=active]:text-black text-muted-foreground"
              >
                <Icon name="Zap" size={16} className="mr-2" />
                JS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-0">
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="font-mono text-sm bg-secondary border-border text-white min-h-[500px] resize-none"
                placeholder="Введите HTML код..."
              />
            </TabsContent>

            <TabsContent value="css" className="mt-0">
              <Textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                className="font-mono text-sm bg-secondary border-border text-white min-h-[500px] resize-none"
                placeholder="Введите CSS код..."
              />
            </TabsContent>

            <TabsContent value="js" className="mt-0">
              <Textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                className="font-mono text-sm bg-secondary border-border text-white min-h-[500px] resize-none"
                placeholder="Введите JavaScript код..."
              />
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl h-[80vh] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white">Превью сайта</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-white rounded overflow-hidden">
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
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Icon name="CheckCircle2" size={24} className="text-primary" />
              Сайт опубликован!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Ваш сайт доступен по адресу:</p>
            <div className="flex items-center gap-2">
              <Input
                value={publishUrl}
                readOnly
                className="bg-secondary border-border text-white font-mono"
              />
              <Button
                onClick={() => navigator.clipboard.writeText(publishUrl)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-black"
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
            <Button
              onClick={() => window.open(publishUrl, '_blank')}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              Открыть сайт
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

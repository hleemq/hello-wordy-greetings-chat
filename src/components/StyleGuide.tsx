
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Input } from "@/components/ui/input";
import { Confetti } from "@/components/ui/confetti";

export const StyleGuide = () => {
  const [showConfetti, setShowConfetti] = React.useState(false);
  
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-franklin-heavy uppercase">WE Finance Style Guide</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Logo</h2>
        <div className="flex gap-8 items-center">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo showTagline />
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Typography</h2>
        <div className="space-y-2">
          <div className="p-4 border rounded-md">
            <h1 className="text-3xl font-franklin-heavy uppercase">Heading 1 - Franklin Gothic Heavy</h1>
          </div>
          <div className="p-4 border rounded-md">
            <h2 className="text-2xl font-franklin-medium">Heading 2 - Franklin Gothic Medium</h2>
          </div>
          <div className="p-4 border rounded-md">
            <p className="font-franklin-book">Body Text - Franklin Gothic Book. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec egestas turpis sed metus placerat, nec sollicitudin justo egestas.</p>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Color System</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-midnight text-white rounded-md h-24 flex items-center justify-center">
            <div className="text-center">
              <div>Midnight</div>
              <div className="text-xs">#000000</div>
            </div>
          </div>
          <div className="p-4 bg-sunshine text-midnight rounded-md h-24 flex items-center justify-center">
            <div className="text-center">
              <div>Sunshine</div>
              <div className="text-xs">#FEFE00</div>
            </div>
          </div>
          <div className="p-4 bg-mindaro text-midnight rounded-md h-24 flex items-center justify-center">
            <div className="text-center">
              <div>Mindaro</div>
              <div className="text-xs">#F4F499</div>
            </div>
          </div>
          <div className="p-4 bg-cloud text-midnight rounded-md h-24 flex items-center justify-center border">
            <div className="text-center">
              <div>Cloud</div>
              <div className="text-xs">#F5F5F5</div>
            </div>
          </div>
          <div className="p-4 bg-success text-white rounded-md h-24 flex items-center justify-center">
            <div className="text-center">
              <div>Success</div>
              <div className="text-xs">#4CAF50</div>
            </div>
          </div>
          <div className="p-4 bg-warning text-midnight rounded-md h-24 flex items-center justify-center">
            <div className="text-center">
              <div>Warning</div>
              <div className="text-xs">#FFC107</div>
            </div>
          </div>
          <div className="p-4 bg-error text-white rounded-md h-24 flex items-center justify-center">
            <div className="text-center">
              <div>Error</div>
              <div className="text-xs">#F44336</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Form Elements</h2>
        <div className="space-y-2 max-w-sm">
          <Input placeholder="Focus on this input to see the effect" />
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              This is a standard card component with our styling applied.
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Progress Bar</h2>
        <div className="space-y-2 max-w-md">
          <Progress value={25} />
          <div className="h-4"></div>
          <Progress value={50} />
          <div className="h-4"></div>
          <Progress value={75} />
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Icons</h2>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Icon name="wallet" />
            <span className="text-sm mt-1">wallet</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="split-bill" />
            <span className="text-sm mt-1">split-bill</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="savings" />
            <span className="text-sm mt-1">savings</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="target" />
            <span className="text-sm mt-1">target</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="calendar" />
            <span className="text-sm mt-1">calendar</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="add" />
            <span className="text-sm mt-1">add</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="check" />
            <span className="text-sm mt-1">check</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="sync" />
            <span className="text-sm mt-1">sync</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-8 mt-4">
          <div className="flex flex-col items-center">
            <Icon name="wallet" filled={true} />
            <span className="text-sm mt-1">filled</span>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Micro-interactions</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2">Button Press Effect:</p>
            <Button variant="default" className="scale-100 active:scale-98 transition-all duration-100">
              Press Me
            </Button>
          </div>
          
          <div>
            <p className="mb-2">Pulse Animation:</p>
            <div className="animate-pulse-update bg-white p-4 rounded-md inline-block">
              This element is being updated
            </div>
          </div>
          
          <div>
            <p className="mb-2">Goal Completion Confetti:</p>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
              }}
            >
              Trigger Confetti
            </Button>
            <Confetti isActive={showConfetti} />
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-franklin-heavy">Dark Mode Toggle</h2>
        <div>
          <DarkModeToggle />
        </div>
        <p>Click to toggle between light and dark mode.</p>
      </section>
    </div>
  );
};

export default StyleGuide;

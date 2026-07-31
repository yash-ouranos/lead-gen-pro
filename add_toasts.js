const fs = require('fs');
const path = require('path');

const dirs = [
  'method-of-contact',
  'promotions',
  'referrals',
  'roles',
  'permissions',
  'staffs',
  'designations',
  'industries'
];

const basePath = path.join(__dirname, 'app', '(app)');

function processForm(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('import toast')) {
    content = content.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport toast from "react-hot-toast";');
  }

  // Find the fetch success block:
  // if (res.ok) {
  //   router.push("/xyz");
  // } else {
  //   alert("Failed to save xyz");
  //   setLoading(false);
  // }
  
  const regex = /if\s*\(res\.ok\)\s*\{\s*router\.push\("([^"]+)"\);\s*\}\s*else\s*\{\s*alert\("([^"]+)"\);\s*setLoading\(false\);\s*\}/g;
  
  content = content.replace(regex, (match, url, errorMsg) => {
    return `if (res.ok) {
      toast.success(initialData ? "Updated successfully" : "Created successfully");
      router.push("${url}");
      router.refresh();
    } else {
      toast.error("${errorMsg}");
      setLoading(false);
    }`;
  });

  // some forms might not have setLoading(false) inside else block
  const regex2 = /if\s*\(res\.ok\)\s*\{\s*router\.push\("([^"]+)"\);\s*\}\s*else\s*\{\s*alert\("([^"]+)"\);\s*\}/g;
  content = content.replace(regex2, (match, url, errorMsg) => {
    return `if (res.ok) {
      toast.success(initialData ? "Updated successfully" : "Created successfully");
      router.push("${url}");
      router.refresh();
    } else {
      toast.error("${errorMsg}");
    }`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
}

function processPage(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('import toast')) {
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport toast from "react-hot-toast";');
  }

  const regex = /const res = await fetch\(`([^`]+)`, \{ method: "DELETE" \}\);\s*if \(res\.ok\) \{\s*([^\}]+)\s*\}\s*setItemToDelete\(null\);/g;
  
  content = content.replace(regex, (match, url, fetchCall) => {
    return `const res = await fetch(\`${url}\`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted successfully");
      ${fetchCall.trim()}
    } else {
      toast.error("Failed to delete");
    }
    setItemToDelete(null);`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
}

dirs.forEach(dir => {
  const dirPath = path.join(basePath, dir);
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (file.endsWith('Form.tsx')) {
      processForm(path.join(dirPath, file));
    }
    if (file === 'page.tsx') {
      processPage(path.join(dirPath, file));
    }
  });
});

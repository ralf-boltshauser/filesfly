# 🚀 FilesFly

A blazingly fast S3 file uploader with a beautiful CLI interface, powered by Bun.

![Demo](./assets/demo.gif)

## ✨ Features

- 🚄 **Lightning Fast**: Utilizes Bun's native S3 client for maximum performance
- 📊 **Real-time Progress**: Beautiful progress bar with upload speed and ETA
- 🔒 **Secure**: Safe credential management via config file
- 🎨 **Beautiful UI**: Colorful and intuitive command-line interface
- 🔄 **URL-Safe**: Automatic filename sanitization for web compatibility
- ⚡️ **Simple**: Just one command to upload or delete files
- 🛡️ **Type-Safe**: Written in TypeScript for reliability

## 🚀 Installation

### Quick Install (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/ralf-boltshauser/filesfly/main/install.sh | bash
```

### Manual Installation
```bash
# Install globally using bun
bun install -g filesfly

# Or install from source
git clone https://github.com/ralf-boltshauser/filesfly.git
cd filesfly
bun install
bun link
```

## ⚙️ Configuration

Create a configuration file at `~/.config/filesfly/filesfly.json`:

```json
{
  "ENDPOINT": "your-endpoint",
  "ACCESS_KEY_ID": "your-access-key",
  "SECRET_ACCESS_KEY": "your-secret",
  "BUCKET": "your-bucket",
  "REGION": "your-region"
}
```

## 📖 Usage

```bash
# Upload a file
ff image.jpg

# Upload with custom name
ff image.jpg -o profile-pic.jpg

# Delete a file
ff image.jpg -d
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/ralf-boltshauser/filesfly.git
cd filesfly
bun install

# Run locally
bun run src/index.ts
```

## 📦 Project Structure

```
├── bin/           # CLI entry point
├── src/
│   ├── cli/       # CLI setup and handling
│   ├── config/    # Configuration management
│   ├── s3/        # S3 operations
│   └── utils/     # Utility functions
└── tests/         # Test files
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh)
- Progress bar by [cli-progress](https://github.com/npkgz/cli-progress)
- Colors by [ansi-colors](https://github.com/doowb/ansi-colors)
